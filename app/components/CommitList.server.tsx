import { ReactNode } from 'react'
import { DateFormatter, getMonthRange, getTimezoneDate } from '../../lib/date'
import { CommitSchema } from '@/db/schema'
import { Params } from '../types'
import { Effect } from 'effect'
import { CommitService } from '@/services/Commit'
import { NextAuthService } from '@/services/NextAuth'
import { renderEffect } from '@/runtime/render'
import { getServerTimezone } from '@/lib/timezone'

export type CommitListServerProps = {
  params: {
    date: Params['date']
  }
  children: (list: CommitSchema[]) => ReactNode
}

export async function CommitListServer({
  params,
  children,
}: CommitListServerProps) {
  const timezone = await getServerTimezone()
  const fallbackDate = DateFormatter.formatDate({
    date: getTimezoneDate(new Date(), timezone),
    formatStr: 'yyyy-MM',
  })

  return renderEffect(
    Effect.gen(function* () {
      const commitService = yield* CommitService
      const nextAuthService = yield* NextAuthService

      const userId = yield* nextAuthService.getUserId()

      return yield* commitService.getList({
        user_id: userId,
        ...getMonthRange(params.date ?? fallbackDate, timezone),
      })
    }),
    (data) => <>{children(data)}</>
  )
}
