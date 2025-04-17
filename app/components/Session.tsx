import { FC } from 'react'
import { Session as NextAuthSession } from 'next-auth'
import { Effect } from 'effect'
import { NextAuthService } from '@/services/NextAuth'

export type SessionReturn = NextAuthSession | null

export type SessionProps = {
  children: FC<SessionReturn>
}

export async function Session({ children }: SessionProps) {
  return (
    <>
      {await Effect.runPromise(
        Effect.gen(function* () {
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
          })
        )
      )}
    </>
  )
}
