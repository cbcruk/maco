import { Effect, pipe } from 'effect'
import { CommitSchema } from '@/db/schema'
import { CommitService, NotFoundError } from '@/services/Commit'
import { NextAuthService } from '@/services/NextAuth'
import { CommitHistory } from '@/app/components/CommitHistory'
import { isUuid } from '@/lib/uuid'
import { CommitDetailParamsProps, CommitDetailProps, NoteId } from '../types'

type CommitHistoryQueryProps = {
  params: NoteId
  children: (revisions: CommitSchema[]) => React.ReactNode
}

async function CommitHistoryQuery({
  params,
  children,
}: CommitHistoryQueryProps) {
  return Effect.gen(function* () {
    const commitService = yield* CommitService
    const nextAuthService = yield* NextAuthService

    const userId = yield* nextAuthService.getUserId()

    return yield* commitService.getHistory({
      user_id: userId,
      note_id: params.note_id,
    })
  }).pipe(
    Effect.provide(NextAuthService.Default),
    Effect.provide(CommitService.Default),
    Effect.match({
      onSuccess: (revisions) => <>{children(revisions)}</>,
      onFailure: (error) => (
        <p className="p-4 text-gray-400" title={error._tag}>
          메모를 찾을 수 없습니다.
        </p>
      ),
    }),
    Effect.runPromise
  )
}

function CommitHistoryParams({ params, children }: CommitDetailParamsProps) {
  return pipe(
    Effect.promise(() => params),
    Effect.flatMap(({ id }) =>
      isUuid(id)
        ? Effect.succeed(id)
        : Effect.fail(new NotFoundError({ message: '잘못된 주소입니다.' }))
    ),
    Effect.match({
      onSuccess: (note_id) => <>{children({ note_id })}</>,
      onFailure: (error) => <pre title={error._tag}>{error.message}</pre>,
    }),
    Effect.runPromise
  )
}

async function CommitHistoryPage({ params }: CommitDetailProps) {
  return (
    <CommitHistoryParams params={params}>
      {({ note_id }) => (
        <CommitHistoryQuery params={{ note_id }}>
          {(revisions) => <CommitHistory revisions={revisions} />}
        </CommitHistoryQuery>
      )}
    </CommitHistoryParams>
  )
}

export default CommitHistoryPage
