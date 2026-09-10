import { Effect } from 'effect'
import { CommitService } from '@/services/Commit'
import { NextAuthService } from '@/services/NextAuth'
import { CommitFormEdit } from '../../components/CommitFormEdit'
import { renderEffect } from '@/runtime/render'
import { getNoteId } from '../params'
import { CommitDetailProps, CommitDetailQueryProps } from '../types'
import { CommitNotFound } from '../_components/CommitNotFound'

function CommitAmendQuery({ params, children }: CommitDetailQueryProps) {
  return renderEffect(
    Effect.gen(function* () {
      const commitService = yield* CommitService
      const nextAuthService = yield* NextAuthService

      const userId = yield* nextAuthService.getUserId()
      const data = yield* commitService.getItemByNoteId({
        user_id: userId,
        note_id: params.note_id,
      })

      return { data, userId }
    }),
    (result) => <>{children(result)}</>,
    <CommitNotFound />
  )
}

async function CommitAmend({ params }: CommitDetailProps) {
  const { note_id } = await getNoteId(params)

  return (
    <CommitAmendQuery params={{ note_id }}>
      {({ data, userId }) => <CommitFormEdit userId={userId} current={data} />}
    </CommitAmendQuery>
  )
}

export default CommitAmend
