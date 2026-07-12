import { Link } from 'react-transition-progress/next'

type ActivityHeatmapProps = {
  /** 'YYYY-MM-DD'(UTC) -> 커밋 수 */
  activity: Record<string, number>
  /** 표시할 주 수 */
  weeks?: number
}

const LEVEL_CLASS = [
  'bg-gray-100 dark:bg-gray-800',
  'bg-green-200 dark:bg-green-900',
  'bg-green-400 dark:bg-green-700',
  'bg-green-500 dark:bg-green-500',
]

function toLevel(count: number) {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 4) return 2

  return 3
}

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addUTCDays(date: Date, amount: number) {
  const next = new Date(date)

  next.setUTCDate(next.getUTCDate() + amount)

  return next
}

export function ActivityHeatmap({ activity, weeks = 26 }: ActivityHeatmapProps) {
  const now = new Date()
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
  // 이번 주의 토요일까지 채워 그리드 오른쪽 끝을 정렬한다.
  const end = addUTCDays(today, 6 - today.getUTCDay())
  const start = addUTCDays(end, -(weeks * 7 - 1))

  const columns: { key: string; count: number; isFuture: boolean }[][] = []

  for (let w = 0; w < weeks; w++) {
    const column = []

    for (let d = 0; d < 7; d++) {
      const date = addUTCDays(start, w * 7 + d)
      const key = toDayKey(date)

      column.push({
        key,
        count: activity[key] ?? 0,
        isFuture: date > today,
      })
    }

    columns.push(column)
  }

  return (
    <div className="px-4 pb-2">
      <div className="overflow-x-auto">
        <div className="flex gap-[3px]">
          {columns.map((column, index) => (
            <div key={index} className="flex flex-col gap-[3px]">
              {column.map(({ key, count, isFuture }) => {
                if (isFuture) {
                  return <div key={key} className="size-[11px]" />
                }

                const cell = (
                  <div
                    className={`size-[11px] rounded-sm ${
                      LEVEL_CLASS[toLevel(count)]
                    }`}
                    title={`${key} · ${count}개`}
                  />
                )

                if (count === 0) {
                  return <div key={key}>{cell}</div>
                }

                return (
                  <Link
                    key={key}
                    prefetch
                    href={{ search: `date=${key.slice(0, 7)}` }}
                    aria-label={`${key} ${count}개`}
                  >
                    {cell}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
