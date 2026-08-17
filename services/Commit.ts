import { Data, Effect, Option, pipe } from 'effect'
import { DatabaseLive } from './Sql'
import { SqliteDrizzle } from '@effect/sql-drizzle/Sqlite'
import {
  commits,
  CommitRecord,
  CommitSchema,
  UserSelectSchema,
} from '@/db/schema'
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { chunk } from 'es-toolkit'
import { commitHash } from '@/lib/hash'

type UserId = {
  user_id: UserSelectSchema['id']
}

type WithUserId<T> = T & UserId

export type CommitServiceGetItemParams = WithUserId<{
  note_id: CommitSchema['note_id']
}>

export type CommitServicePushParams = WithUserId<{
  records: CommitRecord[]
}>

export type PushRejection = {
  hash: string
  reason: string
}

export class NotFoundError extends Data.TaggedError('NotFoundError')<{
  readonly message?: string
}> {}

/** 한 번의 insert에 담는 최대 행 수 (SQLite 바인딩 변수 한계 회피) */
const INSERT_CHUNK_SIZE = 50

/**
 * 어떤 메모의 "지금 내용"은 그 메모의 리비전 중 논리 시계가 가장 큰 것이다.
 * `hlc`가 고정 폭 인코딩이라 문자열 MAX만으로 고를 수 있다.
 *
 * 서브쿼리에도 `user_id` 조건을 거는 것은 방어 목적이다. 타인의 `note_id`로
 * 리비전을 밀어 넣어 남의 메모를 가리는 일은 push에서 이미 막지만,
 * 조회에서도 한 번 더 막아 둔다.
 */
const isLatestRevision = sql`${commits.hlc} = (
  SELECT MAX(revisions.hlc)
  FROM commits AS revisions
  WHERE revisions.note_id = ${commits.note_id}
    AND revisions.user_id = ${commits.user_id}
)`

export class CommitService extends Effect.Service<CommitService>()(
  'CommitService',
  {
    effect: Effect.gen(function* () {
      const db = yield* SqliteDrizzle

      return {
        /**
         * 홈 목록. **월 필터는 스레드의 뿌리에만 걸고, 뿌리가 걸리면 답글은
         * 작성월과 무관하게 따라온다.** 즉 스레드는 뿌리가 쓰인 달에 속한다.
         *
         * 답글에도 월 필터를 걸면 11월에 시작한 대화의 답글이 12월 화면에만
         * 나타나 맥락이 끊긴다.
         *
         * 기간은 호출부가 사용자 타임존으로 계산해 UTC 구간으로 넘긴다
         * (`getMonthRange`). `strftime`으로 자르면 UTC 기준이 되어 월 경계
         * 근처 메모가 옆 달에 묶인다.
         */
        getList(params: WithUserId<{ start: string; end: string }>) {
          return db
            .select()
            .from(commits)
            .orderBy(asc(commits.created))
            .where(
              and(
                eq(commits.user_id, params.user_id),
                eq(commits.deleted, false),
                isLatestRevision,
                sql`${commits.root_note_id} IN (
                  SELECT roots.note_id
                  FROM commits AS roots
                  WHERE roots.user_id = ${params.user_id}
                    AND roots.deleted = 0
                    AND roots.reply_to_note_id IS NULL
                    AND roots.created >= ${params.start}
                    AND roots.created < ${params.end}
                    AND roots.hlc = (
                      SELECT MAX(latest.hlc)
                      FROM commits AS latest
                      WHERE latest.note_id = roots.note_id
                        AND latest.user_id = roots.user_id
                    )
                )`
              )
            )
        },
        /**
         * 한 메모의 리비전 전체 = 수정 이력.
         *
         * 여기서만 `isLatestRevision`을 걸지 않는다. 지난 리비전을 보는 것이
         * 목적이고, 톰스톤도 "언제 지웠는지"라는 이력의 일부다.
         */
        getHistory(params: CommitServiceGetItemParams) {
          return db
            .select()
            .from(commits)
            .orderBy(desc(commits.hlc))
            .where(
              and(
                eq(commits.user_id, params.user_id),
                eq(commits.note_id, params.note_id)
              )
            )
            .pipe(
              Effect.flatMap((results) =>
                results.length > 0
                  ? Effect.succeed(results)
                  : Effect.fail(new NotFoundError({ message: '404' }))
              )
            )
        },
        /** 스레드 전체. 트리이고 `root_note_id`가 비정규화돼 재귀가 필요 없다 */
        getThread(params: WithUserId<{ root_note_id: string }>) {
          return db
            .select()
            .from(commits)
            .orderBy(asc(commits.created))
            .where(
              and(
                eq(commits.user_id, params.user_id),
                eq(commits.deleted, false),
                eq(commits.root_note_id, params.root_note_id),
                isLatestRevision
              )
            )
        },
        getItemByNoteId(params: CommitServiceGetItemParams) {
          return db
            .select()
            .from(commits)
            .where(
              and(
                eq(commits.user_id, params.user_id),
                eq(commits.note_id, params.note_id),
                eq(commits.deleted, false),
                isLatestRevision
              )
            )
            .pipe(
              Effect.flatMap((results) =>
                pipe(
                  Option.fromNullable(results.at(0)),
                  Option.match({
                    onNone: () =>
                      Effect.fail(new NotFoundError({ message: '404' })),
                    onSome: (result) => Effect.succeed(result),
                  })
                )
              )
            )
        },
        /**
         * 기기가 보낸 리비전을 받아들인다.
         *
         * `hash`가 PK이고 `onConflictDoNothing`이므로 같은 배치를 여러 번 보내도
         * 결과가 같다. 아웃박스가 실패 후 그냥 다시 보내면 되는 이유다.
         */
        push(params: CommitServicePushParams) {
          return Effect.gen(function* () {
            const rejected: PushRejection[] = []

            if (params.records.length === 0) {
              return { accepted: [] as string[], rejected }
            }

            // ① 해시가 내용과 일치하는지 확인한다. 이게 없으면 콘텐츠 주소가
            //    장식일 뿐이고, 임의의 hash로 다른 리비전을 가릴 수 있다.
            const verified = yield* Effect.promise(async () => {
              const results = await Promise.all(
                params.records.map(async (record) => {
                  const expected = await commitHash({
                    ...record,
                    user_id: params.user_id,
                  })

                  return { record, valid: expected === record.hash }
                })
              )

              return results
            })

            verified
              .filter(({ valid }) => !valid)
              .forEach(({ record }) => {
                rejected.push({
                  hash: record.hash,
                  reason: '해시가 내용과 일치하지 않습니다.',
                })
              })

            const candidates = verified
              .filter(({ valid }) => valid)
              .map(({ record }) => record)

            if (candidates.length === 0) {
              return { accepted: [] as string[], rejected }
            }

            // ② 남의 메모에 리비전을 끼워 넣거나, 남의 메모에 답글을 다는 것을
            //    막는다. 이어 쓰기 대상도 같은 이유로 검사해야 한다.
            const noteIds = Array.from(
              new Set(
                candidates.flatMap((record) =>
                  record.reply_to_note_id
                    ? [record.note_id, record.reply_to_note_id]
                    : [record.note_id]
                )
              )
            )
            const owners = yield* db
              .selectDistinct({
                note_id: commits.note_id,
                user_id: commits.user_id,
              })
              .from(commits)
              .where(inArray(commits.note_id, noteIds))

            const foreign = new Set(
              owners
                .filter((owner) => owner.user_id !== params.user_id)
                .map((owner) => owner.note_id)
            )

            // 뿌리의 스레드 위치는 해시에 들어가지 않는다(§4.3 — 뿌리는 `reply`
            // 줄이 빠져 이전 해시와 같아야 하므로). 그래서 여기서 따로 따진다.
            const rows = candidates.filter((record) => {
              if (foreign.has(record.note_id)) {
                rejected.push({
                  hash: record.hash,
                  reason: '다른 사용자의 메모입니다.',
                })

                return false
              }

              if (
                record.reply_to_note_id &&
                foreign.has(record.reply_to_note_id)
              ) {
                rejected.push({
                  hash: record.hash,
                  reason: '다른 사용자의 메모에는 이어 쓸 수 없습니다.',
                })

                return false
              }

              if (
                !record.reply_to_note_id &&
                (record.root_note_id !== record.note_id || record.depth !== 0)
              ) {
                rejected.push({
                  hash: record.hash,
                  reason: '뿌리 메모의 스레드 정보가 올바르지 않습니다.',
                })

                return false
              }

              return true
            })

            // `parent_hash`가 아직 서버에 없을 수 있다(오프라인에서 작성 후
            // 곧바로 수정한 경우 부모가 같은 배치에 있다). 조회는 부모 체인이
            // 아니라 `hlc`로 최신을 고르므로 부모가 늦게 도착해도 문제가 없고,
            // 여기서 거절하면 사용자가 쓴 내용을 잃는다. 그래서 통과시킨다.
            for (const rowChunk of chunk(rows, INSERT_CHUNK_SIZE)) {
              yield* db
                .insert(commits)
                .values(
                  rowChunk.map((record) => ({
                    ...record,
                    user_id: params.user_id,
                  }))
                )
                .onConflictDoNothing()
            }

            return {
              accepted: rows.map((record) => record.hash),
              rejected,
            }
          })
        },
      }
    }),
    dependencies: [DatabaseLive],
  }
) {}
