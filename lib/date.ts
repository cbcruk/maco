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
    'yyyy-MM-dd': 'yyyy-MM-dd',
    'yyyy년 M월': 'yyyy년 M월',
    'aaa h시 m분': 'aaa h시 m분',
    'd일 / EEEE': 'd일 / EEEE',
  }

  static formatDate({ date, formatStr, options }: FormatDateParams) {
    return format(date, this.formatMapping[formatStr], options)
  }
}

export type TZName = TZDate['timeZone']

export const DEFAULT_TIMEZONE = 'Asia/Seoul'

/** 브라우저가 자기 타임존을 서버에 알려주는 통로 */
export const TIMEZONE_COOKIE = 'user-timezone'

/**
 * `yyyy-MM` 한 달을 사용자 타임존 기준으로 잘라 UTC 구간으로 바꾼다.
 *
 * `created`는 UTC ISO 문자열이라 `strftime('%Y-%m', created)`로 자르면 UTC
 * 기준 월이 된다. 화면은 사용자 타임존으로 그리므로 월 경계 근처 메모가
 * 옆 달에 묶인다. 경계를 미리 계산해 범위로 비교하면 어긋나지 않고,
 * 인덱스도 그대로 탄다.
 */
export function getMonthRange(month: string, timezone?: TZName) {
  const [year, monthIndex] = month.split('-').map(Number)

  // `TZDate.toISOString()`은 오프셋 형식(`+09:00`)을 돌려주는데 `created`는
  // `Z` 형식으로 저장돼 있다. 문자열로 비교하므로 UTC 표기로 맞춰야 한다.
  const toUtcIso = (date: TZDate) => new Date(date.getTime()).toISOString()

  return {
    start: toUtcIso(new TZDate(year, monthIndex - 1, 1, timezone)),
    end: toUtcIso(new TZDate(year, monthIndex, 1, timezone)),
  }
}
