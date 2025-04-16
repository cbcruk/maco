import { FC } from 'react'
import { User } from 'next-auth'
import { DateFormatter, getTimeZoneDate } from '../../lib/date'
import { CommitSchema } from '@/db/schema'
import { Params } from '../types'
import { Effect, Match } from 'effect'
import { CommitService } from '@/services/Commit'

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

      return (
        <>
          {await Effect.gen(function* () {
            const commitService = yield* CommitService

            return yield* commitService
              .getList({
                user_id: params.user_id,
                date,
              })
              .pipe(
                Effect.match({
                  onSuccess(data) {
                    return <>{children(data)}</>
                  },
                  onFailure(e) {
                    return <pre>{JSON.stringify(e, null, 2)}</pre>
                  },
                })
              )
          }).pipe(Effect.provide(CommitService.Default), Effect.runPromise)}
        </>
      )
    }),
    Match.exhaustive
  )
}
