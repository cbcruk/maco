import { CommitFormEdit } from '../components/CommitFormEdit'
import { Effect, Match } from 'effect'
import { Session } from '@/app/components/Session'
import { CommitService } from '@/services/Commit'

type CommitDetailProps = { params: Promise<{ id: string }> }

async function CommitDetail({ params }: CommitDetailProps) {
  const { id } = await params

  return (
    <Session>
      {(session) => {
        return Match.value(session?.user?.id).pipe(
          Match.when(Match.undefined, () => null),
          Match.orElse(async (user_id) => {
            return await Effect.gen(function* () {
              const commitService = yield* CommitService
              const result = yield* commitService.getItemById({
                id: parseInt(id, 10),
                user_id,
              })

              return result.at(0)
            }).pipe(
              Effect.provide(CommitService.Default),
              Effect.match({
                onSuccess(data) {
                  return Match.value(data).pipe(
                    Match.when(Match.undefined, () => null),
                    Match.orElse((data) => (
                      <CommitFormEdit
                        defaultValues={{
                          emoji: data.emoji,
                          message: data.message,
                        }}
                      >
                        <input type="hidden" name="id" defaultValue={id} />
                      </CommitFormEdit>
                    ))
                  )
                },
                onFailure(error) {
                  return <pre>{JSON.stringify(error, null, 2)}</pre>
                },
              }),
              Effect.runPromise
            )
          })
        )
      }}
    </Session>
  )
}

export default CommitDetail
