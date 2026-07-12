import { Data, Effect, Option, pipe } from 'effect'
import { DatabaseLive } from './Sql'
import { SqliteDrizzle } from '@effect/sql-drizzle/Sqlite'
import { commits, CommitSchema, UserSelectSchema } from '@/db/schema'
import { and, desc, eq, like, sql } from 'drizzle-orm'
import { countTags, parseTags } from '@/lib/tags'

type UserId = {
  user_id: UserSelectSchema['id']
}

type WithUserId<T> = T & UserId

export type CommitServiceGetItemByIdParams = WithUserId<{
  id: CommitSchema['id']
}>

export class NotFoundError extends Data.TaggedError('NotFoundError')<{
  readonly message?: string
}> {}

export class CommitService extends Effect.Service<CommitService>()(
  'CommitService',
  {
    effect: Effect.gen(function* () {
      const db = yield* SqliteDrizzle

      return {
        getList(
          params: WithUserId<{
            date: CommitSchema['created']
            tag?: string
            q?: string
          }>
        ) {
          const { tag, q } = params
          // 태그·검색어가 있으면 기간에 상관없이 전체에서 조회한다.
          const isFiltered = Boolean(tag || q)

          const conditions = [eq(commits.user_id, params.user_id)]

          if (q) {
            conditions.push(like(commits.message, `%${q}%`))
          }

          if (!isFiltered) {
            conditions.push(
              sql`strftime('%Y-%m', ${commits.created}) = ${params.date}`
            )
          }

          const results = db
            .select()
            .from(commits)
            .orderBy(desc(commits.pinned), desc(commits.created))
            .where(and(...conditions))

          if (!tag) {
            return results
          }

          // LIKE 검색은 부분 일치라 `#js` 가 `#json` 을 매칭할 수 있으므로
          // parseTags 로 정확히 일치하는 항목만 남긴다.
          return results.pipe(
            Effect.map((rows) =>
              rows.filter((commit) => parseTags(commit.message).includes(tag))
            )
          )
        },
        getActivity(params: UserId) {
          // created 는 ISO 문자열이라 substr(1,10) 이 'YYYY-MM-DD' (UTC).
          // CommitList 의 created.slice(0, 10) 그룹핑과 동일한 기준.
          return db
            .select({
              day: sql<string>`substr(${commits.created}, 1, 10)`.as('day'),
              count: sql<number>`count(*)`,
            })
            .from(commits)
            .where(eq(commits.user_id, params.user_id))
            .groupBy(sql`day`)
        },
        getTags(params: UserId) {
          return db
            .select({ message: commits.message })
            .from(commits)
            .where(eq(commits.user_id, params.user_id))
            .pipe(
              Effect.map((results) =>
                countTags(results.map((result) => result.message))
              )
            )
        },
        getItemById(params: CommitServiceGetItemByIdParams) {
          return db
            .select()
            .from(commits)
            .where(
              and(
                eq(commits.user_id, params.user_id),
                eq(commits.id, params.id)
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
        getLatestItem(params: UserId) {
          const result = db
            .select()
            .from(commits)
            .orderBy(desc(commits.created))
            .where(eq(commits.user_id, params.user_id))
            .get()

          return result
        },
        createItem(
          body: UserId &
            Omit<CommitSchema, 'id' | 'created' | 'updated' | 'pinned'>
        ) {
          const now = new Date().toISOString()
          const result = db.insert(commits).values({
            ...body,
            created: now,
            updated: now,
          })

          return result
        },
        updateItem(
          params: Pick<CommitSchema, 'id'>,
          body: Pick<CommitSchema, 'emoji' | 'message'>
        ) {
          const result = db
            .update(commits)
            .set(body)
            .where(eq(commits.id, params.id))

          return result
        },
        setPinned(
          params: WithUserId<Pick<CommitSchema, 'id'>>,
          pinned: CommitSchema['pinned']
        ) {
          return db
            .update(commits)
            .set({ pinned, updated: new Date().toISOString() })
            .where(
              and(
                eq(commits.id, params.id),
                eq(commits.user_id, params.user_id)
              )
            )
        },
      }
    }),
    dependencies: [DatabaseLive],
  }
) {}
