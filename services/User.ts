import { SqliteDrizzle } from '@effect/sql-drizzle/Sqlite'
import { DatabaseLive } from './Sql'
import { Effect } from 'effect'
import { UserInsertSchema, users, UserSelectSchema } from '@/db/schema'
import { eq } from 'drizzle-orm'

type CreateUserParams = Omit<UserInsertSchema, 'created' | 'updated'>

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
        const result = db.select().from(users).where(eq(users.email, email))

        return result
      },
    }
  }),
  dependencies: [DatabaseLive],
}) {}
