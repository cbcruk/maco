import { cookies as nextCookies, headers as nextHeaders } from 'next/headers'
import { cache } from 'react'

const DEFAULT_TIMEZONE = 'Asia/Seoul'

export const getServerTimezone = cache(async () => {
  const headers = await nextHeaders()
  const cookies = await nextCookies()
  const timezone =
    cookies.get('user-timezone')?.value ||
    headers.get('x-vercel-ip-timezone') ||
    DEFAULT_TIMEZONE

  return timezone
})
