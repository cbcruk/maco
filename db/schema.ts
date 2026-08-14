import { text, integer, sqliteTable, index } from 'drizzle-orm/sqlite-core'
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

/**
 * 하나의 행은 메모의 한 리비전이며 불변이다.
 *
 * - `hash`는 내용에서 계산되므로 클라이언트가 서버와 조율 없이 만들 수 있고,
 *   PK이므로 같은 리비전을 여러 번 밀어 넣어도 결과가 같다(멱등).
 * - `note_id`는 수정해도 유지되는 메모 자체의 정체성이다.
 * - `parent_hash`는 같은 메모의 직전 리비전을 가리킨다. 두 리비전이 같은
 *   부모를 가리키면 그것이 곧 기기 간 분기(divergence)다.
 * - 삭제는 행을 지우지 않고 `deleted`가 참인 리비전을 쌓는다(톰스톤).
 *   행을 지우면 오프라인에서 지운 메모가 다음 동기화 때 되살아난다.
 */
export const commits = sqliteTable(
  'commits',
  {
    hash: text('hash').primaryKey(),
    note_id: text('note_id').notNull(),
    parent_hash: text('parent_hash'),

    message: text('message').notNull(),
    emoji: text('emoji').notNull(),
    deleted: integer('deleted', { mode: 'boolean' }).notNull().default(false),

    user_id: text('user_id')
      .notNull()
      .references(() => users.id),
    device_id: text('device_id').notNull(),
    /** 하이브리드 논리 시계. 리비전 정렬과 분기 해소(LWW)의 기준 */
    hlc: text('hlc').notNull(),
    /** 메모가 처음 작성된 시각. 리비전이 쌓여도 바뀌지 않는다 */
    created: text('created').notNull(),
  },
  (table) => [
    index('commits_note_hlc').on(table.note_id, table.hlc),
    index('commits_user_created').on(table.user_id, table.created),
  ]
)

export const MESSAGE_MAX_LENGTH = 2000

export const commitSelectSchema = createSelectSchema(commits)

export type CommitSchema = typeof commits.$inferSelect

export type CommitInsertSchema = typeof commits.$inferInsert

/**
 * 기기가 서버로 밀어 넣는 레코드. `user_id`는 서버가 세션에서 채우므로
 * 페이로드에 포함하지 않는다.
 */
export const commitRecordSchema = commitSelectSchema.omit({ user_id: true })

export type CommitRecord = ReturnType<typeof commitRecordSchema.parse>
