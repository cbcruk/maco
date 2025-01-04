import { format } from 'date-fns'
import Link from 'next/link'
import { CommitSchema } from '../schema'

type CommitItemProps = {
  data: CommitSchema
}

export function CommitItem({ data: commit }: CommitItemProps) {
  return (
    <Link
      key={commit.id}
      href={`/commit/${commit.id}`}
      className="flex gap-2 items-start p-4 py-2 border-b border-solid border-gray-900 hover:bg-gray-900 transition-all"
    >
      <span className="text-2xl">{commit.emoji}</span>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 text-sm break-keep">
          {commit.message}
        </div>
        <div className="text-[10px] text-gray-400" title={commit.created}>
          {format(commit.created, 'HH:mm:ss')}
        </div>
      </div>
    </Link>
  )
}
