import { cookies as nextCookies, headers as nextHeaders } from 'next/headers'
import { cache } from 'react'
import { DEFAULT_TIMEZONE, TIMEZONE_COOKIE } from './date'

/**
 * 서버가 쓰는 타임존. 월 경계를 잘라 SQL 로 넘길 때 필요하다(`getMonthRange`).
 *
 * 브라우저가 `TIMEZONE_COOKIE` 에 자기 타임존을 심어 두면 그것을 쓰고,
 * 없으면 Vercel 의 IP 추정값, 그것도 없으면 기본값으로 내려간다.
 *
 * **호출부는 Suspense 경계 안에 있어야 한다.** 쿠키·헤더를 읽는 순간 그
 * 서브트리가 요청 시점에 묶이므로, 루트 레이아웃에서 부르면 앱 전체가
 * 즉시 그릴 수 있는 셸을 가질 수 없게 된다.
 */
export const getServerTimezone = cache(async () => {
  const headers = await nextHeaders()
  const cookies = await nextCookies()

  return (
    cookies.get(TIMEZONE_COOKIE)?.value ||
    headers.get('x-vercel-ip-timezone') ||
    DEFAULT_TIMEZONE
  )
})
