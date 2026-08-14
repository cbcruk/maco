'use client'

import { useContext, useMemo } from 'react'
import { Match } from 'effect'
import { CommitSchema } from '@/db/schema'
import { CommitListGroup } from './CommitListGroup'
import { CommitThreadItem } from './CommitThreadItem'
import { useOutbox } from './Outbox.hooks'
import { buildThreads, groupThreadsByDay, mergeOutbox } from './CommitList.utils'
import { TimezoneContext } from '../context'

type CommitListProps = {
  list: CommitSchema[]
}

function CommitListEmpty() {
  return (
    <p className="flex items-center gap-2 p-4">
      <span className="text-4xl">👻</span>
      <span className="underline decoration-wavy">아무것도 없어요~</span>
    </p>
  )
}

export function CommitList({ list }: CommitListProps) {
  const { timezone } = useContext(TimezoneContext)!
  const outbox = useOutbox()

  const groups = useMemo(
    () =>
      groupThreadsByDay(buildThreads(mergeOutbox(list, outbox)), timezone),
    [list, outbox, timezone]
  )

  return Match.value(groups.length).pipe(
    Match.when(0, () => <CommitListEmpty />),
    Match.orElse(() => (
      <div className="flex flex-col">
        {groups.map((group) => (
          <CommitListGroup key={group.key} label={group.label}>
            {group.threads.map((thread) => (
              <CommitThreadItem key={thread.root.note_id} thread={thread} />
            ))}
          </CommitListGroup>
        ))}
      </div>
    ))
  )
}
