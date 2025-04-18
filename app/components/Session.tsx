import { FC, ReactNode } from 'react'
import { Session as NextAuthSession, User } from 'next-auth'
import { Effect, Option } from 'effect'
import { NextAuthService } from '@/services/NextAuth'

export type SessionReturn = NextAuthSession | null

export type SessionProps = {
  children: FC<SessionReturn>
}

export function Session({ children }: SessionProps) {
  return (
    <>
      {Effect.gen(function* () {
        const nextAuthService = yield* NextAuthService
        const session = yield* nextAuthService.auth()

        return session
      }).pipe(
        Effect.provide(NextAuthService.Default),
        Effect.match({
          onSuccess(session) {
            return <>{children(session)}</>
          },
          onFailure(error) {
            return <pre>{JSON.stringify(error, null, 2)}</pre>
          },
        }),
        Effect.runPromise
      )}
    </>
  )
}

type SessionWithUserIdProps = {
  fallback?: ReactNode
  children: FC<{ id: Extract<User['id'], string> }>
}

export function SessionWithUserId({
  children,
  fallback = null,
}: SessionWithUserIdProps) {
  return (
    <Session>
      {(session) =>
        Option.fromNullable(session?.user?.id).pipe(
          Option.match({
            onNone: () => fallback,
            onSome: (id) => <>{children({ id })}</>,
          })
        )
      }
    </Session>
  )
}
