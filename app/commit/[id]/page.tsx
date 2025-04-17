import { CommitFormEdit } from '../components/CommitFormEdit'
import { Effect, Option, pipe, Schema } from 'effect'
import { Session } from '@/app/components/Session'
import { CommitService } from '@/services/Commit'

type CommitDetailProps = { params: Promise<{ id: string }> }

async function CommitDetail({ params }: CommitDetailProps) {
  return await Effect.gen(function* () {
    return yield* pipe(
      Effect.promise(() => params),
      Effect.flatMap(({ id }) => Schema.decode(Schema.NumberFromString)(id)),
      Effect.match({
        onSuccess(id) {
          return (
            <Session>
              {(session) =>
                Option.fromNullable(session?.user?.id).pipe(
                  Option.match({
                    onNone: () => null,
                    onSome: async (user_id) => {
                      return await Effect.gen(function* () {
                        const commitService = yield* CommitService

                        return yield* commitService
                          .getItemById({
                            id,
                            user_id,
                          })
                          .pipe(
                            Effect.flatMap((results) =>
                              pipe(
                                Option.fromNullable(results.at(0)),
                                Option.match({
                                  onNone: () =>
                                    Effect.fail(
                                      new Error('해당 커밋을 찾을 수 없습니다.')
                                    ),
                                  onSome: (data) => {
                                    return Effect.succeed(data)
                                  },
                                })
                              )
                            )
                          )
                      }).pipe(
                        Effect.provide(CommitService.Default),
                        Effect.match({
                          onSuccess: (result) =>
                            Option.fromNullable(result).pipe(
                              Option.match({
                                onNone: () => null,
                                onSome: (data) => (
                                  <CommitFormEdit
                                    defaultValues={{
                                      emoji: data.emoji,
                                      message: data.message,
                                    }}
                                  >
                                    <input
                                      type="hidden"
                                      name="id"
                                      defaultValue={id}
                                    />
                                  </CommitFormEdit>
                                ),
                              })
                            ),
                          onFailure: (error) => (
                            <pre>{JSON.stringify(error, null, 2)}</pre>
                          ),
                        }),
                        Effect.runPromise
                      )
                    },
                  })
                )
              }
            </Session>
          )
        },
        onFailure(e) {
          return <pre>{JSON.stringify(e, null, 2)}</pre>
        },
      })
    )
  }).pipe(Effect.runPromise)
}

export default CommitDetail
