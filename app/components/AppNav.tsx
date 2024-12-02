import { GetSessionReturn } from './Session'
import { AppNavLink } from './AppNavLink'
import {
  AvatarIcon,
  EnterIcon,
  HomeIcon,
  IdCardIcon,
  Pencil1Icon,
} from '@radix-ui/react-icons'

type AppNavProps = GetSessionReturn

export function AppNav({ isLoggedIn }: AppNavProps) {
  return (
    <nav className="flex items-center gap-3 p-4">
      <AppNavLink href="/">
        <HomeIcon /> 홈
      </AppNavLink>
      {isLoggedIn ? (
        <>
          <AppNavLink href="/commit">
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
