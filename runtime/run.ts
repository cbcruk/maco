import { Effect } from 'effect'
import { AppServices, getAppRuntime } from './app-runtime'

/** 서버 액션과 콜백에서 Effect 를 실행하는 지점. */
export function runEffect<A, E>(effect: Effect.Effect<A, E, AppServices>) {
  return getAppRuntime().runPromise(effect)
}
