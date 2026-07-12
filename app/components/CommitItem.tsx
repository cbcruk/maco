import { Link } from 'react-transition-progress/next'
import { DrawingPinFilledIcon, DrawingPinIcon } from '@radix-ui/react-icons'
import { CommitSchema } from '@/db/schema'
import { CommitDate } from './CommitDate'
import { Markdown } from './Markdown'
import { parseTags } from '@/lib/tags'
import { togglePinAction } from '../commit/actions'
import { merge } from '@/lib/classNames'

type CommitItemProps = {
  data: CommitSchema
}

export function CommitItem({ data: commit }: CommitItemProps) {
  const tags = parseTags(commit.message)

  return (
    <div
      className={merge(
        'group relative flex gap-2 items-start p-4 py-2 border-b border-solid border-gray-900 hover:bg-gray-900 transition-all',
        commit.pinned && 'bg-gray-950/40'
      )}
    >
      <Link
        prefetch
        href={`/commit/${commit.id}`}
        aria-label="커밋 상세 보기"
        className="absolute inset-0"
      />
      <span className="relative text-2xl pointer-events-none">
        {commit.emoji}
      </span>
      <div className="relative flex flex-col gap-0.5 min-w-0">
        <div className="text-sm pointer-events-none [&_a]:pointer-events-auto">
          <Markdown>{commit.message}</Markdown>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pointer-events-none [&_a]:pointer-events-auto">
            {tags.map((tag) => (
              <Link
                key={tag}
                prefetch
                href={{ search: `tag=${encodeURIComponent(tag)}` }}
                className="text-[10px] text-blue-500 dark:text-blue-400 hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
        <div
          className="text-[10px] text-gray-400 pointer-events-none"
          title={commit.updated}
        >
          <CommitDate date={commit.created} formatStr="aaa h시 m분" />
        </div>
      </div>
      <form action={togglePinAction} className="relative ml-auto">
        <input type="hidden" name="id" value={commit.id} />
        <input type="hidden" name="pinned" value={String(!commit.pinned)} />
        <button
          type="submit"
          aria-label={commit.pinned ? '고정 해제' : '고정'}
          title={commit.pinned ? '고정 해제' : '고정'}
          className={merge(
            'p-1 text-gray-400 hover:text-blue-500',
            commit.pinned
              ? 'text-blue-500'
              : 'opacity-0 group-hover:opacity-100 transition-opacity'
          )}
        >
          {commit.pinned ? <DrawingPinFilledIcon /> : <DrawingPinIcon />}
        </button>
      </form>
    </div>
  )
}
