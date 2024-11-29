import { GetSessionReturn } from './Session'
import { AppNavLink } from './AppNavLink'
import { HomeIcon, Pencil1Icon, PersonIcon } from '@radix-ui/react-icons'

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
          <AppNavLink href="/account">
            <PersonIcon /> 계정
          </AppNavLink>
        </>
      ) : (
        <>
          <AppNavLink href="/account/login">로그인</AppNavLink>
          <AppNavLink href="/account/signup">가입</AppNavLink>
        </>
      )}
    </nav>
  )
}
