'use server'

import { Effect } from 'effect'
import { revalidatePath } from 'next/cache'
import { UserService } from '@/services/User'
import { NextAuthService } from '@/services/NextAuth'
import { runEffect } from '@/runtime/run'
import {
  getInitialActionState,
  InitialActionState,
} from '@/helpers/getInitialActionState'
import { toMessage } from '@/helpers/getMessage'

/**
 * 고칠 대상은 세션의 사용자다. 폼이 보낸 `id` 를 그대로 쓰면 값을 바꿔
 * 남의 계정을 고칠 수 있다.
 *
 * 실패는 폼에 돌려준다. 조용히 삼키면 저장된 것처럼 보인다.
 */
export async function updateUser(
  _: unknown,
  formData: FormData
): Promise<InitialActionState> {
  const name = String(formData.get('name') ?? '').trim()

  if (name.length === 0) {
    return { data: null, errors: [toMessage('이름을 입력해주세요.')] }
  }

  return runEffect(
    Effect.gen(function* () {
      const userService = yield* UserService
      const nextAuthService = yield* NextAuthService

      const id = yield* nextAuthService.getUserId()

      yield* userService.updateUser(id, { name })
    }).pipe(
      Effect.tapErrorCause(Effect.logError),
      Effect.match({
        onSuccess(): InitialActionState {
          revalidatePath('/account')

          return getInitialActionState()
        },
        onFailure(): InitialActionState {
          return { data: null, errors: [toMessage('저장하지 못했습니다.')] }
        },
      })
    )
  )
}
