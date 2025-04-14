import { CommitSchema } from '@/db/schema'
import { commits, UserSchema } from '@/db/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'

type UserIdSchema = {
  user_id: UserSchema['id']
}

type GetCommitsParams = UserIdSchema & {
  date: CommitSchema['created']
}

export async function getCommits(params: GetCommitsParams) {
  const result = await db
    .select()
    .from(commits)
    .orderBy(desc(commits.created))
    .where(
      and(
        eq(commits.user_id, params.user_id),
        sql`strftime('%Y-%m', ${commits.created}) = ${params.date}`
      )
    )

  return result
}

type GetCommitParams = UserIdSchema & {
  id: CommitSchema['id']
}

export async function getCommit(params: GetCommitParams) {
  const result = await db
    .select()
    .from(commits)
    .where(and(eq(commits.user_id, params.user_id), eq(commits.id, params.id)))
    .get()

  return result
}

type GetLatestCommitParams = UserIdSchema

export async function getLatestCommit(params: GetLatestCommitParams) {
  const result = await db
    .select()
    .from(commits)
    .orderBy(desc(commits.created))
    .where(eq(commits.user_id, params.user_id))
    .get()

  return result
}

type CreateCommitParams = UserIdSchema &
  Omit<CommitSchema, 'id' | 'created' | 'updated'>

export async function createCommit(body: CreateCommitParams) {
  const now = new Date().toISOString()
  const result = await db.insert(commits).values({
    ...body,
    created: now,
    updated: now,
  })

  return result
}

type UpdateCommitParamas = Pick<CommitSchema, 'id' | 'emoji' | 'message'>

export async function updateCommit(params: UpdateCommitParamas) {
  const result = await db
    .update(commits)
    .set({
      emoji: params.emoji,
      message: params.message,
    })
    .where(eq(commits.id, params.id))

  return result
}
