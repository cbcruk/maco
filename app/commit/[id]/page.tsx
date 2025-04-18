import { CommitFormEdit } from '../components/CommitFormEdit'
import { Effect, pipe, Schema } from 'effect'
import { SessionWithUserId } from '@/app/components/Session'
import { CommitService } from '@/services/Commit'
import {
  CommitDetailQueryProps,
  CommitDetailParamsProps,
  CommitDetailProps,
} from './types'

async function CommitDetailQuery({ params, children }: CommitDetailQueryProps) {
  return Effect.gen(function* () {
    const commitService = yield* CommitService
    const result = yield* commitService.getItemById(params)

    return result
  }).pipe(
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
        <SessionWithUserId>
          {({ id: user_id }) => (
            <CommitDetailQuery params={{ id, user_id }}>
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
        </SessionWithUserId>
      )}
    </CommitDetailParams>
  )
}

export default CommitDetail
