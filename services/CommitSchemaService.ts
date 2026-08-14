import { commitRecordSchema, MESSAGE_MAX_LENGTH } from '@/db/schema'
import { Data, Effect } from 'effect'
import { z } from 'zod'

export class ZodParseError extends Data.TaggedError('ZodParseError')<{
  readonly message: string
  readonly cause: unknown
}> {}

/** 한 번에 밀어 넣을 수 있는 리비전 수 */
const MAX_BATCH_SIZE = 500

const recordSchema = commitRecordSchema.extend({
  message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
  emoji: z.string().min(1),
  note_id: z.string().uuid(),
  hash: z.string().regex(/^[0-9a-f]{64}$/),
  parent_hash: z.string().regex(/^[0-9a-f]{64}$/).nullable(),
})

const pushSchema = z.array(recordSchema).max(MAX_BATCH_SIZE)

export class CommitSchemaService extends Effect.Service<CommitSchemaService>()(
  'CommitSchemaService',
  {
    effect: Effect.gen(function* () {
      return {
        parsePushPayload(payload: unknown) {
          const parseResult = pushSchema.safeParse(payload)

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
