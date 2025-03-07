import { useSearchParams } from 'next/navigation'
import { getTimeZoneDate } from '../lib/date'
import { addMonths, format } from 'date-fns'

export function useCommitListNav() {
  const searchParams = useSearchParams()
  const date = searchParams.get('date')
  const getTimeZoneDateParams = date ? new Date(date) : undefined
  const tzDate = getTimeZoneDate(getTimeZoneDateParams)
  const currentMonth = format(tzDate, 'yyyy년 M월')
  const prevMonth = format(addMonths(tzDate, -1), 'yyyy-MM')
  const nextMonth = format(addMonths(tzDate, 1), 'yyyy-MM')

  return {
    currentMonth,
    prevMonth,
    nextMonth,
  }
}
