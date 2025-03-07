import { Link } from 'react-transition-progress/next'
import { GetSessionReturn } from './Session'
import { AppNavLink } from './AppNavLink'
import {
  AvatarIcon,
  EnterIcon,
  IdCardIcon,
  Pencil1Icon,
} from '@radix-ui/react-icons'
import { AppNavLogo } from './AppNavLogo'

type AppNavProps = GetSessionReturn

export function AppNav({ isLoggedIn }: AppNavProps) {
  return (
    <nav className="flex items-center gap-3 p-4">
      <Link prefetch href="/">
        <AppNavLogo />
      </Link>
      {isLoggedIn ? (
        <>
          <AppNavLink href="/commit" pattern="/commit/{:id}">
            <Pencil1Icon /> 쓰기
          </AppNavLink>
          <AppNavLink href="/account" pattern="/account/{:menu}">
            <AvatarIcon /> 계정
          </AppNavLink>
        </>
      ) : (
        <>
          <AppNavLink href="/account/login">
            <EnterIcon /> 로그인
          </AppNavLink>
          <AppNavLink href="/account/signup">
            <IdCardIcon /> 가입
          </AppNavLink>
        </>
      )}
    </nav>
  )
}
