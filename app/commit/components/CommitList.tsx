import { CommitSchema } from '@/app/schema'
import { formatDistanceToNow } from 'date-fns'

type CommitListProps = {
  items: CommitSchema[]
}

export function CommitList({ items }: CommitListProps) {
  return (
    <div className="flex flex-col gap-2 w-min max-h-[300px] overflow-auto p-2 rounded-lg bg-neutral-900">
      {items.map((commit) => (
        <div key={commit.id} className="flex items-start gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{commit.emoji}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-100 text-xs">{commit.message}</span>
            <span className="text-slate-200 text-[10px]" title={commit.created}>
              {formatDistanceToNow(new Date(commit.created), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
