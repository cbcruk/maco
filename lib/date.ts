import { TZDate } from '@date-fns/tz'
import { format } from 'date-fns'

export function getTimezoneDate(defaultDate = new Date(), timezone?: TZName) {
  const date = new TZDate(defaultDate, timezone)

  return date
}

type FormatParams = Parameters<typeof format>

export type FormatDateParams = {
  date: FormatParams[0]
  formatStr: keyof typeof DateFormatter.formatMapping
  options?: FormatParams[2]
}

export class DateFormatter {
  static formatMapping = {
    'yyyy-MM': 'yyyy-MM',
    'yyyy년 M월': 'yyyy년 M월',
    'aaa h시 m분': 'aaa h시 m분',
    'd일 / EEEE': 'd일 / EEEE',
  }

  static formatDate({ date, formatStr, options }: FormatDateParams) {
    return format(date, this.formatMapping[formatStr], options)
  }
}

export type TZName = TZDate['timeZone']
