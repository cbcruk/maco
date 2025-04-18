import { commitSelectSchema } from '@/db/schema'
import { Data, Effect } from 'effect'

export class ZodParseError extends Data.TaggedError('ZodParseError')<{
  readonly message: string
  readonly cause: unknown
}> {}

export class CommitSchemaService extends Effect.Service<CommitSchemaService>()(
  'CommitSchemaService',
  {
    effect: Effect.gen(function* () {
      return {
        parseCreateFormData(formData: FormData) {
          const parseResult = commitSelectSchema
            .pick({
              user_id: true,
              emoji: true,
              message: true,
            })
            .safeParse({
              user_id: formData.get('user_id'),
              emoji: formData.get('emoji'),
              message: formData.get('message'),
            })

          if (parseResult.error) {
            return Effect.fail(
              new ZodParseError({
                message: parseResult.error.message,
                cause: parseResult.error.cause,
              })
            )
          }

          return Effect.succeed(parseResult.data)
        },
        parseUpdateFormData(formData: FormData) {
          const parseResult = commitSelectSchema
            .pick({
              id: true,
              emoji: true,
              message: true,
            })
            .safeParse({
              id: Number(formData.get('id')),
              emoji: formData.get('emoji'),
              message: formData.get('message'),
            })

          if (parseResult.error) {
            return Effect.fail(
              new ZodParseError({
                message: parseResult.error.message,
                cause: parseResult.error.cause,
              })
            )
          }

          return Effect.succeed(parseResult.data)
        },
      }
    }),
  }
) {}
