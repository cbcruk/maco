import { Layer, ManagedRuntime } from 'effect'
import { CommitService } from '@/services/Commit'
import { CommitSchemaService } from '@/services/CommitSchemaService'
import { NextAuthService } from '@/services/NextAuth'
import { UserService } from '@/services/User'

/**
 * 앱이 쓰는 서비스 전체. 서비스가 늘면 여기에만 추가하고, 호출부에서는
 * 다시 provide 하지 않는다.
 *
 * 함수로 감싼 이유는 순환 참조 때문이다. `lib/auth.ts` 가 NextAuthService 를
 * 거쳐 이 모듈로 돌아오므로, 모듈 평가 중에 서비스 클래스를 읽으면 아직
 * 초기화되지 않은 바인딩에 닿는다.
 */
const makeAppLayer = () =>
  Layer.mergeAll(
    CommitService.Default,
    CommitSchemaService.Default,
    NextAuthService.Default,
    UserService.Default
  )

export type AppServices = Layer.Layer.Success<ReturnType<typeof makeAppLayer>>

const makeAppRuntime = () => ManagedRuntime.make(makeAppLayer())

type AppRuntime = ReturnType<typeof makeAppRuntime>

const globalForRuntime = globalThis as typeof globalThis & {
  __macoRuntime?: AppRuntime
}

/**
 * Layer 를 한 번만 만들어 요청 사이에 재사용한다. 호출부마다 provide 하면
 * libsql 클라이언트와 Drizzle 계층이 매번 새로 만들어진다.
 *
 * 개발 모드의 HMR 은 모듈을 다시 평가하므로 globalThis 에 매달아 둔다.
 */
export const getAppRuntime = () =>
  (globalForRuntime.__macoRuntime ??= makeAppRuntime())
