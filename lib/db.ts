import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
})

export const db = drizzle(turso)
