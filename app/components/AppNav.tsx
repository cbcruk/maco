import { Link } from 'react-transition-progress/next'
import { AppNavLogo } from './AppNavLogo'
import { AppNavAccount } from './AppNavAccount'
import { AppNavLink } from './AppNavLink'
import { KeyboardIcon } from '@radix-ui/react-icons'

export function AppNav() {
  return (
    <nav className="flex items-center justify-between p-4">
      <div className="flex items-center gap-2">
        <Link prefetch href="/" title="홈">
          <AppNavLogo />
        </Link>
        <AppNavLink href="/commit" pattern="/commit/{:id}" title="기록">
          <KeyboardIcon />
        </AppNavLink>
      </div>
      <div className="flex">
        <AppNavAccount />
      </div>
    </nav>
  )
}
