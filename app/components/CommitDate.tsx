import { DateFormatter, FormatDateParams, getTimezoneDate } from '@/lib/date'
import { getServerTimezone } from '@/lib/timezone'
import { ko } from 'date-fns/locale/ko'

type CommitDateProps = FormatDateParams

export async function CommitDate({ date, formatStr }: CommitDateProps) {
  const timezone = await getServerTimezone()
  const timezoneDate = getTimezoneDate(new Date(date), timezone)
  const formattedDate = DateFormatter.formatDate({
    date: timezoneDate,
    formatStr,
    options: {
      locale: ko,
    },
  })

  return <>{formattedDate}</>
}
