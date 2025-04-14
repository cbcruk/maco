import { FC } from 'react'
import { getCommits } from '../../lib/commit'
import { User } from 'next-auth'
import { DateFormatter, getTimeZoneDate } from '../../lib/date'
import { CommitSchema } from '@/db/schema'
import { Params } from '../types'
import { Match } from 'effect'

export type CommitListServerProps = {
  params: {
    date: Params['date']
    user_id: User['id']
  }
  children: FC<CommitSchema[]>
}

export async function CommitListServer({
  params,
  children,
}: CommitListServerProps) {
  const defaultDate = DateFormatter.formatDate(getTimeZoneDate(), 'yyyy-MM')

  return Match.value(params).pipe(
    Match.when({ user_id: Match.undefined }, () => null),
    Match.when({ user_id: Match.string }, async (params) => {
      const date = params.date ?? defaultDate
      const data = await getCommits({
        user_id: params.user_id,
        date,
      })

      return <>{children(data)}</>
    }),
    Match.exhaustive
  )
}
