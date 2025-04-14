import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createSelectSchema } from 'drizzle-zod'

const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  image: text('image'),
  created: text('created'),
  updated: text('updated'),
})

export const userSelectSchema = createSelectSchema(users)

export type UserSchema = typeof users.$inferSelect

export const commits = sqliteTable('commits', {
  id: integer('id').primaryKey(),
  message: text('message').notNull(),
  emoji: text('emoji').notNull(),
  updated: text('updated').notNull(),
  created: text('created').notNull(),
  user_id: text('user_id')
    .notNull()
    .references(() => users.id),
})

export const commitSelectSchema = createSelectSchema(commits)

export type CommitSchema = typeof commits.$inferSelect
