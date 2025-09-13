import { groupBy } from 'es-toolkit'
import { CommitListGroup } from './CommitListGroup'
import { CommitItem } from './CommitItem'
import { CommitSchema } from '@/db/schema'
import { Match } from 'effect'
import { DateFormatter, getTimezoneDate } from '@/lib/date'
import { ko } from 'date-fns/locale/ko'
import { getServerTimezone } from '@/lib/timezone'

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

export async function CommitList({ list }: CommitListProps) {
  const timezone = await getServerTimezone()

  return Match.value(list.length).pipe(
    Match.when(0, () => <CommitListEmpty />),
    Match.orElse(() => {
      const group = groupBy(list, (item) => item.created.slice(0, 10))
      const entries = Object.entries(group)

      return (
        <div className="flex flex-col">
          {entries.map(([date, list]) => {
            const timezoneDate = getTimezoneDate(new Date(date), timezone)
            const label = DateFormatter.formatDate({
              date: timezoneDate,
              formatStr: 'd일 / EEEE',
              options: {
                locale: ko,
              },
            })

            return (
              <CommitListGroup key={date} label={label}>
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
