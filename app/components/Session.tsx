import { FC } from 'react'
import { auth } from '@/lib/auth'
import { Session as NextAuthSession } from 'next-auth'

export type SessionReturn = NextAuthSession | null

export type SessionProps = {
  children: FC<SessionReturn>
}

export async function Session({ children }: SessionProps) {
  const session = await auth()

  return <>{children(session)}</>
}
