import { auth, signIn } from '@/lib/auth'
import { Data, Effect } from 'effect'

export class NextAuthError extends Data.TaggedError('NextAuthError')<{
  readonly message: string
  readonly cause: unknown
}> {}

export class NextAuthService extends Effect.Service<NextAuthService>()(
  'NextAuthService',
  {
    effect: Effect.gen(function* () {
      return {
        auth: () =>
          Effect.tryPromise({
            try: () => auth(),
            catch: (e) =>
              new NextAuthError({
                cause: e,
                message: '인증에러가 발생했습니다.',
              }),
          }),
      }
    }),
  }
) {}

export class NextAuthSignService extends Effect.Service<NextAuthSignService>()(
  'NextAuthSignService',
  {
    effect: Effect.gen(function* () {
      return {
        signIn: () =>
          Effect.tryPromise({
            try: () =>
              signIn('github', {
                redirectTo: '/',
              }).catch((e) => {
                throw e
              }),
            catch: (e) =>
              new NextAuthError({
                cause: e,
                message: '로그인에러가 발생했습니다.',
              }),
          }),
      }
    }),
  }
) {}
