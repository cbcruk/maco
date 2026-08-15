/**
 * 데이터를 기다리는 동안 보여줄 자리표시자.
 *
 * 실제 UI와 같은 뼈대(여백·구분선·줄 높이)를 쓰는 것이 중요하다. 모양이
 * 다르면 내용이 도착할 때 화면이 튀어서, 없느니만 못한 로딩 상태가 된다.
 */
const LINE_CLASS_NAME = 'animate-pulse rounded bg-gray-800'

const ROW_CLASS_NAME =
  'flex gap-2 items-start p-4 py-2 border-b border-solid border-gray-900'

function CommitItemSkeleton({ width = 'w-40' }: { width?: string }) {
  return (
    <div className={ROW_CLASS_NAME}>
      <div className={`${LINE_CLASS_NAME} size-6 shrink-0 rounded-full`} />
      <div className="flex flex-col gap-1.5 py-1">
        <div className={`${LINE_CLASS_NAME} h-3 ${width}`} />
        <div className={`${LINE_CLASS_NAME} h-2 w-16`} />
      </div>
    </div>
  )
}

const ROW_WIDTHS = ['w-48', 'w-32', 'w-56', 'w-40', 'w-24']

export function CommitListSkeleton() {
  return (
    <div className="flex flex-col" aria-busy="true" aria-label="불러오는 중">
      <div className="py-2">
        <div className="px-4 pb-2">
          <div className={`${LINE_CLASS_NAME} h-3 w-20`} />
        </div>
        {ROW_WIDTHS.map((width) => (
          <CommitItemSkeleton key={width} width={width} />
        ))}
      </div>
    </div>
  )
}

export function CommitThreadSkeleton() {
  return (
    <div className="flex flex-col" aria-busy="true" aria-label="불러오는 중">
      <CommitItemSkeleton width="w-56" />
      <div className="ml-4 border-l border-gray-800 pl-6">
        <CommitItemSkeleton width="w-40" />
      </div>
    </div>
  )
}

export function CommitFormSkeleton() {
  return (
    <div
      className="flex flex-col gap-2 p-4"
      aria-busy="true"
      aria-label="불러오는 중"
    >
      <div className={`${LINE_CLASS_NAME} size-8 rounded-full`} />
      <div className={`${LINE_CLASS_NAME} h-24 w-72 max-w-full rounded-lg`} />
      <div className={`${LINE_CLASS_NAME} h-7 w-16 rounded-lg`} />
    </div>
  )
}

/** 월 이동 바의 자리표시자. 높이를 실제와 맞춰 화면이 튀지 않게 한다 */
export function CommitListNavFallback() {
  return (
    <div className="flex justify-between items-center p-4">
      <div className={`${LINE_CLASS_NAME} h-4 w-24`} />
      <div className="flex gap-4">
        <div className={`${LINE_CLASS_NAME} size-4`} />
        <div className={`${LINE_CLASS_NAME} size-4`} />
      </div>
    </div>
  )
}
