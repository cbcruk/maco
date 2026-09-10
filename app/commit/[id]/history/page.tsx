import { Effect } from 'effect'
import { ReactNode } from 'react'
import { CommitSchema } from '@/db/schema'
import { CommitService } from '@/services/Commit'
import { NextAuthService } from '@/services/NextAuth'
import { CommitHistory } from '@/app/components/CommitHistory'
import { renderEffect } from '@/runtime/render'
import { getNoteId } from '../params'
import { CommitDetailProps, NoteId } from '../types'
import { CommitNotFound } from '../_components/CommitNotFound'

type CommitHistoryQueryProps = {
  params: NoteId
  children: (revisions: CommitSchema[]) => ReactNode
}

function CommitHistoryQuery({ params, children }: CommitHistoryQueryProps) {
  return renderEffect(
    Effect.gen(function* () {
      const commitService = yield* CommitService
      const nextAuthService = yield* NextAuthService

      const userId = yield* nextAuthService.getUserId()

      return yield* commitService.getHistory({
        user_id: userId,
        note_id: params.note_id,
      })
    }),
    (revisions) => <>{children(revisions)}</>,
    <CommitNotFound />
  )
}

async function CommitHistoryPage({ params }: CommitDetailProps) {
  const { note_id } = await getNoteId(params)

  return (
    <CommitHistoryQuery params={{ note_id }}>
      {(revisions) => <CommitHistory revisions={revisions} />}
    </CommitHistoryQuery>
  )
}

export default CommitHistoryPage
