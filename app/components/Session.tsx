import { ReactNode } from 'react'
import { Session as NextAuthSession } from 'next-auth'
import { Effect } from 'effect'
import { NextAuthService } from '@/services/NextAuth'
import { renderEffect } from '@/runtime/render'
import { SessionFallback } from './SessionFallback'

export type SessionReturn = NextAuthSession | null

export type SessionProps = {
  children: (session: SessionReturn) => ReactNode
}

export function Session({ children }: SessionProps) {
  return renderEffect(
    Effect.gen(function* () {
      const nextAuthService = yield* NextAuthService

      return yield* nextAuthService.getSession()
    }),
    (session) => <>{children(session)}</>,
    // 로그인 전에는 실패가 정상이다. 오류 내용을 DOM 속성으로 흘리지 않는다.
    <div className="p-4">
      <SessionFallback />
    </div>
  )
}
