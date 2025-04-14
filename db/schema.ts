import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  image: text('image'),
  created: text('created'),
  updated: text('updated'),
})

export const userSelectSchema = createSelectSchema(users)

export const userInsertSchema = createInsertSchema(users)

export type UserSelectSchema = typeof users.$inferSelect

export type UserInsertSchema = typeof users.$inferInsert

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
