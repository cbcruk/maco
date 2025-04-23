import { CommitFormEdit } from '../components/CommitFormEdit'
import { Effect, pipe, Schema } from 'effect'
import { CommitService } from '@/services/Commit'
import {
  CommitDetailQueryProps,
  CommitDetailParamsProps,
  CommitDetailProps,
} from './types'
import { NextAuthService } from '@/services/NextAuth'

async function CommitDetailQuery({ params, children }: CommitDetailQueryProps) {
  return Effect.gen(function* () {
    const commitService = yield* CommitService
    const nextAuthService = yield* NextAuthService

    const userId = yield* nextAuthService.getUserId()
    const result = yield* commitService.getItemById({
      user_id: userId,
      id: params.id,
    })

    return result
  }).pipe(
    Effect.provide(NextAuthService.Default),
    Effect.provide(CommitService.Default),
    Effect.match({
      onSuccess: (data) => <>{children({ data })}</>,
      onFailure: (error) => <pre>{JSON.stringify(error, null, 2)}</pre>,
    }),
    Effect.runPromise
  )
}

function CommitDetailParams({ params, children }: CommitDetailParamsProps) {
  return pipe(
    pipe(
      Effect.promise(() => params),
      Effect.flatMap(({ id }) => Schema.decode(Schema.NumberFromString)(id))
    ),
    Effect.match({
      onSuccess: (id) => <>{children({ id })}</>,
      onFailure: (e) => <pre title={e._tag}>{e.message}</pre>,
    }),
    Effect.runPromise
  )
}

async function CommitDetail({ params }: CommitDetailProps) {
  return (
    <CommitDetailParams params={params}>
      {({ id }) => (
        <CommitDetailQuery params={{ id }}>
          {({ data }) => (
            <CommitFormEdit
              defaultValues={{
                emoji: data.emoji,
                message: data.message,
              }}
            >
              <input type="hidden" name="id" defaultValue={id} />
            </CommitFormEdit>
          )}
        </CommitDetailQuery>
      )}
    </CommitDetailParams>
  )
}

export default CommitDetail
