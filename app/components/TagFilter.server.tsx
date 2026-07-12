import { Effect } from 'effect'
import { CommitService } from '@/services/Commit'
import { NextAuthService } from '@/services/NextAuth'
import { Params } from '../types'
import { TagFilter } from './TagFilter'

export type TagFilterServerProps = {
  activeTag: Params['tag']
}

export async function TagFilterServer({ activeTag }: TagFilterServerProps) {
  return (
    <>
      {await Effect.gen(function* () {
        const commitService = yield* CommitService
        const nextAuthService = yield* NextAuthService

        const userId = yield* nextAuthService.getUserId()

        return yield* commitService.getTags({ user_id: userId })
      }).pipe(
        Effect.provide(NextAuthService.Default),
        Effect.provide(CommitService.Default),
        Effect.match({
          onSuccess: (tags) => <TagFilter tags={tags} activeTag={activeTag} />,
          onFailure: () => null,
        }),
        Effect.runPromise
      )}
    </>
  )
}
