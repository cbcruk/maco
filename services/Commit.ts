import { Data, Effect, Option, pipe } from 'effect'
import { DatabaseLive } from './Sql'
import { SqliteDrizzle } from '@effect/sql-drizzle/Sqlite'
import { commits, CommitSchema, UserSelectSchema } from '@/db/schema'
import { and, desc, eq, sql } from 'drizzle-orm'

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
        getList(params: WithUserId<{ date: CommitSchema['created'] }>) {
          const results = db
            .select()
            .from(commits)
            .orderBy(desc(commits.created))
            .where(
              and(
                eq(commits.user_id, params.user_id),
                sql`strftime('%Y-%m', ${commits.created}) = ${params.date}`
              )
            )

          return results
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
          body: UserId & Omit<CommitSchema, 'id' | 'created' | 'updated'>
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
      }
    }),
    dependencies: [DatabaseLive],
  }
) {}
