import { ReactNode } from 'react'
import { unstable_rethrow } from 'next/navigation'
import { Cause, Effect, Exit, Option } from 'effect'
import { AppServices, getAppRuntime } from './app-runtime'

/**
 * 로그인 전이거나 없는 메모를 열었을 때처럼 예상된 실패. ERROR 로 남기면
 * 진짜 오류가 묻힌다.
 */
const EXPECTED_TAGS = new Set([
  'NotFoundError',
  'SessionError',
  'SessionUserIdError',
])

const isExpected = (cause: Cause.Cause<unknown>) =>
  Cause.failureOption(cause).pipe(
    Option.exists(
      (error) =>
        typeof error === 'object' &&
        error !== null &&
        '_tag' in error &&
        typeof error._tag === 'string' &&
        EXPECTED_TAGS.has(error._tag)
    )
  )

const logCause = (cause: Cause.Cause<unknown>) =>
  isExpected(cause) ? Effect.logDebug(cause) : Effect.logError(cause)

const DEFAULT_FALLBACK = (
  <p className="p-4 text-gray-400">요청을 처리하지 못했습니다.</p>
)

/**
 * notFound, redirect 는 Next 가 예외로 흘려보내는 제어 흐름이다. 우리가 대신
 * 처리하면 해당 UI 가 렌더되지 않으므로 그대로 다시 던진다. Effect 가 감싼
 * 경우가 있어 cause 사슬도 함께 확인한다.
 */
function rethrowFrameworkError(error: unknown) {
  unstable_rethrow(error)

  if (error instanceof Error && error.cause !== undefined) {
    rethrowFrameworkError(error.cause)
  }
}

/**
 * 서버 컴포넌트가 Effect 를 실행하는 유일한 경계.
 *
 * 성공값만 JSX 로 옮기면 되고, 실패와 결함은 서버 로그로 보낸 뒤 화면에는
 * 대체 UI 만 남긴다. 에러 내용을 화면이나 DOM 속성으로 흘리지 않는다.
 */
export async function renderEffect<A, E>(
  effect: Effect.Effect<A, E, AppServices>,
  onSuccess: (value: A) => ReactNode,
  fallback: ReactNode = DEFAULT_FALLBACK
): Promise<ReactNode> {
  const exit = await getAppRuntime().runPromiseExit(
    effect.pipe(Effect.map(onSuccess), Effect.tapErrorCause(logCause))
  )

  if (Exit.isSuccess(exit)) {
    return exit.value
  }

  rethrowFrameworkError(Cause.squash(exit.cause))

  return fallback
}
