'use server'

import { UserService } from '@/services/User'
import { Effect } from 'effect'
import { revalidatePath } from 'next/cache'

export async function updateUser(_: unknown, formData: FormData) {
  return Effect.gen(function* () {
    const userService = yield* UserService
    const id = formData.get('id') as string

    yield* userService.updateUser(id, {
      name: formData.get('name') as string,
    })
  }).pipe(
    Effect.provide(UserService.Default),
    Effect.match({
      onSuccess: () => {
        revalidatePath('/account')
      },
      onFailure: () => Effect.void,
    }),
    Effect.runPromise
  )
}
