import { Match } from 'effect'
import { SessionContextValue } from 'next-auth/react'

export function isAvatarActive(
  status: SessionContextValue['status'],
  pathname: string
) {
  return Match.value({
    status,
    pathname,
  }).pipe(
    Match.when({ status: 'authenticated', pathname: '/account' }, () => true),
    Match.orElse(() => false)
  )
}
