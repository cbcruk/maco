import { UserInsertSchema, users, UserSelectSchema } from '@/db/schema'
import { db } from './db'
import { eq } from 'drizzle-orm'

type CreateUserParams = Omit<UserInsertSchema, 'created' | 'updated'>

export async function createUser(body: CreateUserParams) {
  const now = new Date().toISOString()
  const result = await db.insert(users).values({
    ...body,
    created: now,
    updated: now,
  })

  return result
}

export async function findUserByEmail(email: UserSelectSchema['email']) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get()

  return result
}
