import { Effect } from 'effect'
import { CommitService } from '@/services/Commit'
import { NextAuthService } from '@/services/NextAuth'
import { ActivityHeatmap } from './ActivityHeatmap'

export async function ActivityHeatmapServer() {
  return (
    <>
      {await Effect.gen(function* () {
        const commitService = yield* CommitService
        const nextAuthService = yield* NextAuthService

        const userId = yield* nextAuthService.getUserId()
        const rows = yield* commitService.getActivity({ user_id: userId })

        return rows
      }).pipe(
        Effect.provide(NextAuthService.Default),
        Effect.provide(CommitService.Default),
        Effect.match({
          onSuccess: (rows) => {
            const activity = Object.fromEntries(
              rows.map((row) => [row.day, row.count])
            )

            return <ActivityHeatmap activity={activity} />
          },
          onFailure: () => null,
        }),
        Effect.runPromise
      )}
    </>
  )
}
