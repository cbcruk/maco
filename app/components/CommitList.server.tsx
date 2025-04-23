import { FC } from 'react'
import { DateFormatter, getTimeZoneDate } from '../../lib/date'
import { CommitSchema } from '@/db/schema'
import { Params } from '../types'
import { Effect } from 'effect'
import { CommitService } from '@/services/Commit'
import { NextAuthService } from '@/services/NextAuth'

export type CommitListServerProps = {
  params: {
    date: Params['date']
  }
  children: FC<CommitSchema[]>
}

const DEFAULT_DATE = DateFormatter.formatDate(getTimeZoneDate(), 'yyyy-MM')

export function CommitListServer({ params, children }: CommitListServerProps) {
  return (
    <>
      {Effect.gen(function* () {
        const commitService = yield* CommitService
        const nextAuthService = yield* NextAuthService

        const userId = yield* nextAuthService.getUserId()
        const results = yield* commitService.getList({
          user_id: userId,
          date: params.date ?? DEFAULT_DATE,
        })

        return results
      }).pipe(
        Effect.provide(NextAuthService.Default),
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
