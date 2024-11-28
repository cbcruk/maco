import { FC } from 'react'
import { getSession } from '../lib/auth'

export type GetSessionReturn = Awaited<ReturnType<typeof getSession>>

export type SessionProps = {
  children: FC<GetSessionReturn>
}

export async function Session({ children }: SessionProps) {
  const session = await getSession()

  return <>{children(session)}</>
}
