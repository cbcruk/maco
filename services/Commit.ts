import { Data, Effect, Option, pipe } from 'effect'
import { DatabaseLive } from './Sql'
import { SqliteDrizzle } from '@effect/sql-drizzle/Sqlite'
import {
  commits,
  CommitRecord,
  CommitSchema,
  UserSelectSchema,
} from '@/db/schema'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
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
        getList(params: WithUserId<{ date: CommitSchema['created'] }>) {
          return db
            .select()
            .from(commits)
            .orderBy(desc(commits.created))
            .where(
              and(
                eq(commits.user_id, params.user_id),
                eq(commits.deleted, false),
                isLatestRevision,
                sql`strftime('%Y-%m', ${commits.created}) = ${params.date}`
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

            // ② 남의 메모에 리비전을 끼워 넣는 것을 막는다.
            const noteIds = Array.from(
              new Set(candidates.map((record) => record.note_id))
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

            const rows = candidates.filter((record) => {
              if (!foreign.has(record.note_id)) {
                return true
              }

              rejected.push({
                hash: record.hash,
                reason: '다른 사용자의 메모입니다.',
              })

              return false
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
