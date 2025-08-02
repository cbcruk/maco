import { FC } from 'react'
import { Session as NextAuthSession } from 'next-auth'
import { Effect } from 'effect'
import { NextAuthService } from '@/services/NextAuth'
import { SessionFallback } from './SessionFallback'

export type SessionReturn = NextAuthSession | null

export type SessionProps = {
  children: FC<SessionReturn>
}

export function Session({ children }: SessionProps) {
  return (
    <>
      {Effect.gen(function* () {
        const nextAuthService = yield* NextAuthService
        const session = yield* nextAuthService.getSession()

        return session
      }).pipe(
        Effect.provide(NextAuthService.Default),
        Effect.match({
          onSuccess(session) {
            return <>{children(session)}</>
          },
          onFailure(error) {
            return (
              <div className="p-4">
                <SessionFallback data-error={JSON.stringify(error, null, 2)} />
              </div>
            )
          },
        }),
        Effect.runPromise
      )}
    </>
  )
}
