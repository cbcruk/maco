import { Effect, pipe } from 'effect'
import { CommitService, NotFoundError } from '@/services/Commit'
import { NextAuthService } from '@/services/NextAuth'
import { CommitFormEdit } from '../../components/CommitFormEdit'
import { isUuid } from '@/lib/uuid'
import {
  CommitDetailParamsProps,
  CommitDetailProps,
  CommitDetailQueryProps,
} from '../types'

async function CommitAmendQuery({ params, children }: CommitDetailQueryProps) {
  return Effect.gen(function* () {
    const commitService = yield* CommitService
    const nextAuthService = yield* NextAuthService

    const userId = yield* nextAuthService.getUserId()
    const data = yield* commitService.getItemByNoteId({
      user_id: userId,
      note_id: params.note_id,
    })

    return { data, userId }
  }).pipe(
    Effect.provide(NextAuthService.Default),
    Effect.provide(CommitService.Default),
    Effect.match({
      onSuccess: (result) => <>{children(result)}</>,
      onFailure: (error) => (
        <p className="p-4 text-gray-400" title={error._tag}>
          메모를 찾을 수 없습니다.
        </p>
      ),
    }),
    Effect.runPromise
  )
}

function CommitAmendParams({ params, children }: CommitDetailParamsProps) {
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

async function CommitAmend({ params }: CommitDetailProps) {
  return (
    <CommitAmendParams params={params}>
      {({ note_id }) => (
        <CommitAmendQuery params={{ note_id }}>
          {({ data, userId }) => (
            <CommitFormEdit userId={userId} current={data} />
          )}
        </CommitAmendQuery>
      )}
    </CommitAmendParams>
  )
}

export default CommitAmend
