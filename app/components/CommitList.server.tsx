import { FC } from 'react'
import { DateFormatter, getTimeZoneDate } from '../../lib/date'
import { CommitSchema, UserSelectSchema } from '@/db/schema'
import { Params } from '../types'
import { Effect } from 'effect'
import { CommitService } from '@/services/Commit'

export type CommitListServerProps = {
  params: {
    date: Params['date']
    user_id: UserSelectSchema['id']
  }
  children: FC<CommitSchema[]>
}

const DEFAULT_DATE = DateFormatter.formatDate(getTimeZoneDate(), 'yyyy-MM')

export function CommitListServer({ params, children }: CommitListServerProps) {
  return (
    <>
      {Effect.gen(function* () {
        const commitService = yield* CommitService
        const results = yield* commitService.getList({
          user_id: params.user_id,
          date: params.date ?? DEFAULT_DATE,
        })

        return results
      }).pipe(
        Effect.provide(CommitService.Default),
        Effect.match({
          onSuccess: (data) => <>{children(data)}</>,
          onFailure: (e) => <pre>{e._tag}</pre>,
        }),
        Effect.runPromise
      )}
    </>
  )
}
