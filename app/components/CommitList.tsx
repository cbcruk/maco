import { ko } from 'date-fns/locale'
import { groupBy } from 'es-toolkit'
import { CommitListGroup } from './CommitListGroup'
import { CommitItem } from './CommitItem'
import { CommitSchema } from '@/db/schema'
import { DateFormatter } from '../../lib/date'
import { Match } from 'effect'

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
  return Match.value(list.length).pipe(
    Match.when(0, () => <CommitListEmpty />),
    Match.orElse(() => {
      const group = groupBy(list, (item) => item.created.slice(0, 10))
      const entries = Object.entries(group)

      return (
        <div className="flex flex-col">
          {entries.map(([date, list]) => {
            return (
              <CommitListGroup
                key={date}
                label={DateFormatter.formatDate(date, 'd일 / EEEE', {
                  locale: ko,
                })}
              >
                {list.map((commit) => {
                  return <CommitItem key={commit.id} data={commit} />
                })}
              </CommitListGroup>
            )
          })}
        </div>
      )
    })
  )
}
