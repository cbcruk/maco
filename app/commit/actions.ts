'use server'

import { revalidatePath } from 'next/cache'
import { toMessage } from '../../helpers/getMessage'
import { InitialActionState } from '../../helpers/getInitialActionState'
import { Effect } from 'effect'
import { CommitService } from '@/services/Commit'
import { CommitSchemaService } from '@/services/CommitSchemaService'
import { NextAuthService } from '@/services/NextAuth'

export const createCommitAction = async (
  _prevState: InitialActionState,
  formData: FormData
) =>
  Effect.runPromise(
    Effect.gen(function* () {
      const commitService = yield* CommitService
      const commitSchemaService = yield* CommitSchemaService
      const parseResult = yield* commitSchemaService.parseCreateFormData(
        formData
      )

      return yield* commitService.createItem(parseResult)
    }).pipe(
      Effect.provide(CommitService.Default),
      Effect.provide(CommitSchemaService.Default),
      Effect.match({
        onSuccess() {
          revalidatePath('/')
          revalidatePath('/commit')

          return {
            data: 'SUCCESS',
            errors: [],
          }
        },
        onFailure(error) {
          return {
            data: null,
            errors: [toMessage(error._tag)],
          }
        },
      })
    )
  )

export const togglePinAction = async (formData: FormData): Promise<void> => {
  await Effect.runPromise(
    Effect.gen(function* () {
      const commitService = yield* CommitService
      const nextAuthService = yield* NextAuthService

      const userId = yield* nextAuthService.getUserId()
      const id = Number(formData.get('id'))
      const pinned = formData.get('pinned') === 'true'

      return yield* commitService.setPinned({ id, user_id: userId }, pinned)
    }).pipe(
      Effect.provide(CommitService.Default),
      Effect.provide(NextAuthService.Default),
      Effect.match({
        onSuccess() {
          revalidatePath('/')
          revalidatePath('/commit')
        },
        onFailure() {},
      })
    )
  )
}

export const updateCommitAction = async (
  _prevState: InitialActionState,
  formData: FormData
) =>
  Effect.runPromise(
    Effect.gen(function* () {
      const commitService = yield* CommitService
      const commitSchemaService = yield* CommitSchemaService
      const parseResult = yield* commitSchemaService.parseUpdateFormData(
        formData
      )
      const { id, ...body } = parseResult

      return yield* commitService.updateItem({ id }, body)
    }).pipe(
      Effect.provide(CommitService.Default),
      Effect.provide(CommitSchemaService.Default),
      Effect.match({
        onSuccess() {
          revalidatePath('/')
          revalidatePath('/commit')

          return {
            data: 'SUCCESS',
            errors: [],
          }
        },
        onFailure(error) {
          return {
            data: null,
            errors: [toMessage(error._tag)],
          }
        },
      })
    )
  )
