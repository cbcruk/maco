import { TZDate } from '@date-fns/tz'
import { format } from 'date-fns'

export function getTimeZoneDate(defaultDate = new Date()) {
  const date = new TZDate(defaultDate, 'Asia/Seoul')

  return date
}

export class DateFormatter {
  static formatMapping = {
    'yyyy-MM': 'yyyy-MM',
    'yyyy년 M월': 'yyyy년 M월',
    'aaa h시 m분': 'aaa h시 m분',
    'd일 / EEEE': 'd일 / EEEE',
  }

  static formatDate(
    date: Parameters<typeof format>[0],
    formatStr: keyof typeof this.formatMapping,
    options?: Parameters<typeof format>[2]
  ) {
    return format(date, this.formatMapping[formatStr], options)
  }
}
