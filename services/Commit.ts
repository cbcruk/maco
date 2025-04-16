import { Data, Effect } from 'effect'
import { DatabaseLive } from './Sql'
import { SqliteDrizzle } from '@effect/sql-drizzle/Sqlite'
import {
  commits,
  CommitSchema,
  commitSelectSchema,
  UserSelectSchema,
} from '@/db/schema'
import { and, desc, eq, sql } from 'drizzle-orm'

type UserId = {
  user_id: UserSelectSchema['id']
}

type WithUserId<T> = T & UserId

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
        getItemById(params: WithUserId<{ id: CommitSchema['id'] }>) {
          const result = db
            .select()
            .from(commits)
            .where(
              and(
                eq(commits.user_id, params.user_id),
                eq(commits.id, params.id)
              )
            )

          return result
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

export class ZodParseError extends Data.TaggedError('ZodParseError')<{
  readonly message: string
  readonly cause: unknown
}> {}

export class CommitSchemaService extends Effect.Service<CommitSchemaService>()(
  'CommitSchemaService',
  {
    effect: Effect.gen(function* () {
      return {
        parseCreateFormData(formData: FormData) {
          const parseResult = commitSelectSchema
            .pick({
              user_id: true,
              emoji: true,
              message: true,
            })
            .safeParse({
              user_id: formData.get('user_id'),
              emoji: formData.get('emoji'),
              message: formData.get('message'),
            })

          if (parseResult.error) {
            return Effect.fail(
              new ZodParseError({
                message: parseResult.error.message,
                cause: parseResult.error.cause,
              })
            )
          }

          return Effect.succeed(parseResult.data)
        },
        parseUpdateFormData(formData: FormData) {
          const parseResult = commitSelectSchema
            .pick({
              id: true,
              emoji: true,
              message: true,
            })
            .safeParse({
              id: Number(formData.get('id')),
              emoji: formData.get('emoji'),
              message: formData.get('message'),
            })

          if (parseResult.error) {
            return Effect.fail(
              new ZodParseError({
                message: parseResult.error.message,
                cause: parseResult.error.cause,
              })
            )
          }

          return Effect.succeed(parseResult.data)
        },
      }
    }),
  }
) {}
