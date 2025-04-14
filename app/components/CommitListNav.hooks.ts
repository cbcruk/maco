import { useSearchParams } from 'next/navigation'
import { DateFormatter, getTimeZoneDate } from '../../lib/date'
import { addMonths } from 'date-fns'

export function useCommitListNav() {
  const searchParams = useSearchParams()
  const date = searchParams.get('date')
  const getTimeZoneDateParams = date ? new Date(date) : undefined
  const tzDate = getTimeZoneDate(getTimeZoneDateParams)
  const currentMonth = DateFormatter.formatDate(tzDate, 'yyyy년 M월')
  const prevMonth = DateFormatter.formatDate(addMonths(tzDate, -1), 'yyyy-MM')
  const nextMonth = DateFormatter.formatDate(addMonths(tzDate, 1), 'yyyy-MM')

  return {
    currentMonth,
    prevMonth,
    nextMonth,
  }
}
