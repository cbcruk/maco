import { FC } from 'react'
import { getCommits } from '../lib/commit'
import { CommitSchema } from '../schema'

type CommitListServerProps = {
  children: FC<CommitSchema[]>
}

export async function CommitListServer({ children }: CommitListServerProps) {
  const commitResponse = await getCommits()

  if (!commitResponse.ok) {
    return null
  }

  const data = (await commitResponse.json()) as CommitSchema[]

  return <>{children(data)}</>
}
