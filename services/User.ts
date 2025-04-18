import { SqliteDrizzle } from '@effect/sql-drizzle/Sqlite'
import { DatabaseLive } from './Sql'
import { Data, Effect, Option, pipe } from 'effect'
import { UserInsertSchema, users, UserSelectSchema } from '@/db/schema'
import { eq } from 'drizzle-orm'

type CreateUserParams = Omit<UserInsertSchema, 'created' | 'updated'>

export class NotFoundError extends Data.TaggedError('NotFoundError')<{
  readonly message?: string
}> {}

export class UserService extends Effect.Service<UserService>()('UserService', {
  effect: Effect.gen(function* () {
    const db = yield* SqliteDrizzle

    return {
      createUser(body: CreateUserParams) {
        const now = new Date().toISOString()
        const result = db.insert(users).values({
          ...body,
          created: now,
          updated: now,
        })

        return result
      },
      findUserByEmail(email: UserSelectSchema['email']) {
        const result = db
          .select()
          .from(users)
          .where(eq(users.email, email))
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

        return result
      },
    }
  }),
  dependencies: [DatabaseLive],
}) {}
