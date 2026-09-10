import { Effect } from 'effect'
import { CommitService } from '@/services/Commit'
import { NextAuthService } from '@/services/NextAuth'
import { CommitThread } from '@/app/components/CommitThread'
import { renderEffect } from '@/runtime/render'
import { getNoteId } from './params'
import { CommitDetailProps, CommitThreadQueryProps } from './types'
import { CommitNotFound } from './_components/CommitNotFound'

/**
 * 메모를 열었을 때 나와야 하는 것은 수정 폼이 아니라 그 메모와 거기서 자란
 * 것들이다. 답글을 열어도 뿌리부터 스레드 전체를 보여준다.
 */
function CommitThreadQuery({ params, children }: CommitThreadQueryProps) {
  return renderEffect(
    Effect.gen(function* () {
      const commitService = yield* CommitService
      const nextAuthService = yield* NextAuthService

      const userId = yield* nextAuthService.getUserId()
      const item = yield* commitService.getItemByNoteId({
        user_id: userId,
        note_id: params.note_id,
      })
      const thread = yield* commitService.getThread({
        user_id: userId,
        root_note_id: item.root_note_id,
      })

      return { thread, rootNoteId: item.root_note_id, userId }
    }),
    (result) => <>{children(result)}</>,
    <CommitNotFound />
  )
}

async function CommitDetail({ params }: CommitDetailProps) {
  const { note_id } = await getNoteId(params)

  return (
    <CommitThreadQuery params={{ note_id }}>
      {({ thread, rootNoteId, userId }) => (
        <CommitThread list={thread} rootNoteId={rootNoteId} userId={userId} />
      )}
    </CommitThreadQuery>
  )
}

export default CommitDetail
