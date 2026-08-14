'use server'

import { revalidatePath } from 'next/cache'
import { Effect } from 'effect'
import { CommitService, PushRejection } from '@/services/Commit'
import { CommitSchemaService } from '@/services/CommitSchemaService'
import { NextAuthService } from '@/services/NextAuth'
import { toMessage } from '@/helpers/getMessage'

export type PushResult =
  | { ok: true; accepted: string[]; rejected: PushRejection[] }
  | { ok: false; error: string; retryable: boolean }

/**
 * 아웃박스가 밀어 넣는 리비전을 받는다.
 *
 * `user_id`는 페이로드가 아니라 세션에서 가져온다. 클라이언트가 보낸 값을
 * 신뢰하면 타인 명의로 메모를 만들 수 있다.
 */
export async function pushCommitsAction(payload: unknown): Promise<PushResult> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const commitService = yield* CommitService
      const commitSchemaService = yield* CommitSchemaService
      const nextAuthService = yield* NextAuthService

      const user_id = yield* nextAuthService.getUserId()
      const records = yield* commitSchemaService.parsePushPayload(payload)

      return yield* commitService.push({ user_id, records })
    }).pipe(
      Effect.provide(NextAuthService.Default),
      Effect.provide(CommitService.Default),
      Effect.provide(CommitSchemaService.Default),
      Effect.match({
        onSuccess({ accepted, rejected }): PushResult {
          if (accepted.length > 0) {
            revalidatePath('/')
            revalidatePath('/commit')
          }

          return { ok: true, accepted, rejected }
        },
        onFailure(error): PushResult {
          // 세션 문제는 다시 로그인하면 풀리므로 큐에 남겨 둔다.
          // 반면 스키마 검증 실패는 몇 번을 보내도 같은 결과다.
          return {
            ok: false,
            error: toMessage(error._tag).message,
            retryable: error._tag !== 'ZodParseError',
          }
        },
      })
    )
  )
}
