import { formatDistanceToNow } from 'date-fns'
import { CommitSchema } from '../schema'

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

  return (
    <div className="flex flex-col">
      {list.map((commit) => {
        return (
          <div
            key={commit.id}
            className="flex gap-2 items-start p-4 py-2 border-b border-solid border-gray-900"
          >
            <span className="text-2xl">{commit.emoji}</span>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1 text-sm break-keep">
                {commit.message}
              </div>
              <div className="text-[10px] text-gray-400" title={commit.created}>
                {formatDistanceToNow(new Date(commit.created), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
