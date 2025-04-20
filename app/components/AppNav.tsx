import { Link } from 'react-transition-progress/next'
import { AppNavLogo } from './AppNavLogo'
import { AppNavAccount } from './AppNavAccount/AppNavAccount'
import { AppNavLink } from './AppNavLink'
import Image from 'next/image'

export function AppNav() {
  return (
    <nav className="flex items-center justify-between p-4">
      <div className="flex items-center gap-2">
        <Link prefetch href="/" title="홈">
          <AppNavLogo />
        </Link>
        <AppNavLink href="/commit" pattern="/commit/{:id}" title="기록">
          <Image src="/icons/keyboard.svg" alt="" width={24} height={24} />
        </AppNavLink>
      </div>
      <div className="flex">
        <AppNavAccount />
      </div>
    </nav>
  )
}
