import { TZDate } from '@date-fns/tz'

export function getTimeZoneDate(defaultDate = new Date()) {
  const date = new TZDate(defaultDate, 'Asia/Seoul')

  return date
}
