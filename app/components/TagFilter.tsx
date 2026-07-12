import { Link } from 'react-transition-progress/next'
import { TagCount } from '@/lib/tags'
import { Params } from '../types'
import { merge } from '@/lib/classNames'

type TagFilterProps = {
  tags: TagCount[]
  activeTag: Params['tag']
}

export function TagFilter({ tags, activeTag }: TagFilterProps) {
  if (tags.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
      {activeTag && (
        <Link
          prefetch
          href="/"
          className="text-xs text-gray-400 hover:underline"
        >
          ✕ 전체
        </Link>
      )}
      {tags.map(({ tag, count }) => {
        const isActive = tag === activeTag

        return (
          <Link
            key={tag}
            prefetch
            href={{ search: `tag=${encodeURIComponent(tag)}` }}
            className={merge(
              'rounded-full px-2 py-0.5 text-xs transition-colors',
              isActive
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            )}
          >
            #{tag}
            <span className="ml-1 opacity-60">{count}</span>
          </Link>
        )
      })}
    </div>
  )
}
