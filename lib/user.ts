import { UserInsertSchema, users } from '@/db/schema'
import { db } from './db'

type CreateUserParams = Omit<UserInsertSchema, 'created' | 'updated'>

export async function createUser(body: CreateUserParams) {
  const now = new Date().toISOString()
  const user = await db.insert(users).values({
    ...body,
    created: now,
    updated: now,
  })

  return user
}
