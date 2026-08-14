'use client'

import { useContext, useMemo } from 'react'
import { groupBy } from 'es-toolkit'
import { Match } from 'effect'
import { ko } from 'date-fns/locale/ko'
import { CommitSchema } from '@/db/schema'
import { DateFormatter, getTimezoneDate } from '@/lib/date'
import { toRecord } from '@/lib/outbox'
import { CommitListGroup } from './CommitListGroup'
import { CommitItem } from './CommitItem'
import { CommitView } from './CommitList.types'
import { useOutbox } from './Outbox.hooks'
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

/**
 * 서버가 준 목록에 아직 올라가지 않은 로컬 리비전을 겹친다.
 *
 * 리비전이 불변이고 `hlc`로 순서가 정해지므로, 생성·수정·삭제를 구분해 다룰
 * 필요가 없다. 같은 메모의 리비전 중 논리 시계가 가장 큰 것만 남기고,
 * 그것이 톰스톤이면 목록에서 빠진다 — 세 경우가 한 규칙으로 처리된다.
 */
function mergeOutbox(list: CommitSchema[], pending: CommitView[]) {
  const byNote = new Map<string, CommitView>()

  list.forEach((revision) => {
    byNote.set(revision.note_id, { ...revision, pending: false })
  })

  pending.forEach((revision) => {
    const current = byNote.get(revision.note_id)

    if (!current || revision.hlc > current.hlc) {
      byNote.set(revision.note_id, revision)
    }
  })

  return Array.from(byNote.values())
    .filter((revision) => !revision.deleted)
    .sort((a, b) => b.created.localeCompare(a.created))
}

export function CommitList({ list }: CommitListProps) {
  const { timezone } = useContext(TimezoneContext)!
  const outbox = useOutbox()

  const merged = useMemo(
    () =>
      mergeOutbox(
        list,
        outbox.map((item) => ({ ...toRecord(item), pending: true }))
      ),
    [list, outbox]
  )

  return Match.value(merged.length).pipe(
    Match.when(0, () => <CommitListEmpty />),
    Match.orElse(() => {
      const entries = Object.entries(
        groupBy(merged, (item) => item.created.slice(0, 10))
      )

      return (
        <div className="flex flex-col">
          {entries.map(([date, group]) => {
            const label = DateFormatter.formatDate({
              date: getTimezoneDate(new Date(date), timezone),
              formatStr: 'd일 / EEEE',
              options: {
                locale: ko,
              },
            })

            return (
              <CommitListGroup key={date} label={label}>
                {group.map((commit) => (
                  <CommitItem key={commit.note_id} data={commit} />
                ))}
              </CommitListGroup>
            )
          })}
        </div>
      )
    })
  )
}
