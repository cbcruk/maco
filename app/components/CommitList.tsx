import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CommitSchema } from '../schema'
import { groupBy } from 'es-toolkit'
import { CommitListGroup } from './CommitListGroup'
import { CommitItem } from './CommitItem'

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
  if (list.length === 0) {
    return <CommitListEmpty />
  }

  const group = groupBy(list, (item) => item.created.slice(0, 10))
  const entries = Object.entries(group)

  return (
    <div className="flex flex-col">
      {entries.map(([date, list]) => {
        return (
          <CommitListGroup
            key={date}
            label={format(date, 'yyyy년 MM월 dd일 EEEE', { locale: ko })}
          >
            {list.map((commit) => {
              return <CommitItem key={commit.id} data={commit} />
            })}
          </CommitListGroup>
        )
      })}
    </div>
  )
}
