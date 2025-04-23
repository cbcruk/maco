import { auth, signIn } from '@/lib/auth'
import { Data, Effect, Option, pipe } from 'effect'

export class NextAuthError extends Data.TaggedError('NextAuthError')<{
  readonly message: string
  readonly cause: unknown
}> {}

export class SessionError extends Data.TaggedError('SessionError')<{
  readonly message: string
}> {}

export class SessionUserIdError extends Data.TaggedError('SessionUserIdError')<{
  readonly message: string
}> {}

export class NextAuthService extends Effect.Service<NextAuthService>()(
  'NextAuthService',
  {
    effect: Effect.gen(function* () {
      const getSession = () =>
        Effect.tryPromise({
          try: () => auth(),
          catch: (e) =>
            new NextAuthError({
              cause: e,
              message: '인증에러가 발생했습니다.',
            }),
        }).pipe(
          Effect.flatMap((session) =>
            pipe(
              Option.fromNullable(session),
              Option.match({
                onSome(session) {
                  return Effect.succeed(session)
                },
                onNone() {
                  return Effect.fail(
                    new SessionError({ message: '세션정보가 없습니다.' })
                  )
                },
              })
            )
          )
        )

      return {
        getSession,
        getUserId: () =>
          Effect.gen(function* () {
            const session = yield* getSession()
            const id = yield* Option.fromNullable(session.user?.id).pipe(
              Option.match({
                onNone() {
                  return Effect.fail(
                    new SessionUserIdError({
                      message: 'ID값이 존재하지 않습니다.',
                    })
                  )
                },
                onSome(id) {
                  return Effect.succeed(id)
                },
              })
            )

            return id
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
