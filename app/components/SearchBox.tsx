import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Params } from '../types'

type SearchBoxProps = {
  defaultValue: Params['q']
}

export function SearchBox({ defaultValue }: SearchBoxProps) {
  return (
    <form action="/" className="px-4 pb-2">
      <div className="flex items-center gap-2 rounded-lg border px-2 py-1.5 focus-within:border-blue-500 dark:border-gray-800">
        <MagnifyingGlassIcon className="shrink-0 text-gray-400" />
        <input
          name="q"
          type="search"
          defaultValue={defaultValue ?? ''}
          placeholder="검색어를 입력해 주세요"
          className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
        />
      </div>
    </form>
  )
}
