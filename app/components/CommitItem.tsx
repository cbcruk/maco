import { Link } from 'react-transition-progress/next'
import { ko } from 'date-fns/locale'
import { DateFormatter } from '../../lib/date'
import { CommitSchema } from '@/db/schema'

type CommitItemProps = {
  data: CommitSchema
}

export function CommitItem({ data: commit }: CommitItemProps) {
  return (
    <Link
      key={commit.id}
      prefetch
      href={`/commit/${commit.id}`}
      className="flex gap-2 items-start p-4 py-2 border-b border-solid border-gray-900 hover:bg-gray-900 transition-all"
    >
      <span className="text-2xl">{commit.emoji}</span>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 text-sm break-keep">
          {commit.message}
        </div>
        <div className="text-[10px] text-gray-400" title={commit.updated}>
          {DateFormatter.formatDate(commit.created, 'aaa h시 m분', {
            locale: ko,
          })}
        </div>
      </div>
    </Link>
  )
}
