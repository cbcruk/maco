import { FC } from 'react'
import { getCommits } from '../lib/commit'
import { CommitSchema } from '../schema'

type CommitListServerProps = {
  date?: string
  children: FC<CommitSchema[]>
}

export async function CommitListServer({
  date,
  children,
}: CommitListServerProps) {
  const commitResponse = await getCommits({ date })

  if (!commitResponse.ok) {
    return null
  }

  const data = (await commitResponse.json()) as CommitSchema[]

  return <>{children(data)}</>
}
