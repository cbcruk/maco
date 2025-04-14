'use client'

import { Match } from 'effect'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AppNavAccount() {
  const session = useSession()
  const pathname = usePathname()

  return (
    <Link
      href="/account"
      data-active={Match.value({
        status: session.status,
        pathname,
      }).pipe(
        Match.when(
          { status: 'authenticated', pathname: '/account' },
          () => true
        ),
        Match.orElse(() => false)
      )}
      className="w-[24px] h-[24px] bg-gray-600 rounded-full overflow-hidden data-[active=true]:border border-gray-400"
      title="계정"
    >
      {Match.value(session.status).pipe(
        Match.when('authenticated', () => (
          <Image
            src={session.data?.user?.image as string}
            alt=""
            width={24}
            height={24}
          />
        )),
        Match.orElse(() => null)
      )}
    </Link>
  )
}
