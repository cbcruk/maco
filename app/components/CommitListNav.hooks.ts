import { useSearchParams } from 'next/navigation'
import { DateFormatter, getTimezoneDate, TZName } from '../../lib/date'
import { addMonths } from 'date-fns'

export function useCommitListNav(timezone: TZName) {
  const searchParams = useSearchParams()
  const date = searchParams.get('date')
  const getTimeZoneDateParams = date ? new Date(date) : undefined
  const tzDate = getTimezoneDate(getTimeZoneDateParams, timezone)
  const currentMonth = DateFormatter.formatDate({
    date: tzDate,
    formatStr: 'yyyy년 M월',
  })
  const [prevMonth, nextMonth] = [-1, 1].map((amount) =>
    DateFormatter.formatDate({
      date: addMonths(tzDate, amount),
      formatStr: 'yyyy-MM',
    })
  )

  return {
    currentMonth,
    prevMonth,
    nextMonth,
  }
}
