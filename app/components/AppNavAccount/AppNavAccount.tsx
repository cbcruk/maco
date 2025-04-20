'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { AppNavAccountForm, AppNavAccountFormLogin } from './AppNavAccountForm'
import { Popover, PopoverContent, PopoverTrigger } from '../Popover'
import { AppNavAccountAvatar } from './AppNavAccountAvatar'
import { AppNavAccountAvatarStatus } from './AppNavAccountAvatarStatus'
import { isAvatarActive } from './AppNavAccount.utils'
import { Match } from 'effect'

export function AppNavAccount() {
  const session = useSession()
  const pathname = usePathname()

  return Match.value(session).pipe(
    Match.when({ status: 'authenticated' }, () => (
      <Popover>
        <PopoverTrigger className="inline-flex">
          <AppNavAccountAvatarStatus
            data-active={isAvatarActive(session.status, pathname)}
          >
            <AppNavAccountAvatar image={session.data?.user?.image} />
          </AppNavAccountAvatarStatus>
        </PopoverTrigger>
        <PopoverContent align="end" className="z-50" sideOffset={10}>
          <AppNavAccountForm />
        </PopoverContent>
      </Popover>
    )),
    Match.when({ status: 'unauthenticated' }, () => (
      <AppNavAccountAvatarStatus>
        <AppNavAccountFormLogin />
      </AppNavAccountAvatarStatus>
    )),
    Match.orElse(() => <AppNavAccountAvatarStatus />)
  )
}
