import { Effect, pipe } from 'effect'
import { CommitFormEdit } from '../components/CommitFormEdit'
import { CommitService, NotFoundError } from '@/services/Commit'
import {
  CommitDetailQueryProps,
  CommitDetailParamsProps,
  CommitDetailProps,
} from './types'
import { NextAuthService } from '@/services/NextAuth'
import { isUuid } from '@/lib/uuid'

async function CommitDetailQuery({ params, children }: CommitDetailQueryProps) {
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
      onFailure: (error) => <pre>{JSON.stringify(error, null, 2)}</pre>,
    }),
    Effect.runPromise
  )
}

function CommitDetailParams({ params, children }: CommitDetailParamsProps) {
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

async function CommitDetail({ params }: CommitDetailProps) {
  return (
    <CommitDetailParams params={params}>
      {({ note_id }) => (
        <CommitDetailQuery params={{ note_id }}>
          {({ data, userId }) => (
            <CommitFormEdit userId={userId} current={data} />
          )}
        </CommitDetailQuery>
      )}
    </CommitDetailParams>
  )
}

export default CommitDetail
