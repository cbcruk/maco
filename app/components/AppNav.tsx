import { GetSessionReturn } from './Session'
import { AppNavLink } from './AppNavLink'

type AppNavProps = GetSessionReturn

export function AppNav({ isLoggedIn }: AppNavProps) {
  return (
    <div className="flex gap-2 p-4">
      <AppNavLink href="/">홈</AppNavLink>
      {isLoggedIn ? (
        <>
          <AppNavLink href="/commit">쓰기</AppNavLink>
          <AppNavLink href="/signout">로그아웃</AppNavLink>
        </>
      ) : (
        <>
          <AppNavLink href="/signin">로그인</AppNavLink>
          <AppNavLink href="/signup">가입</AppNavLink>
        </>
      )}
    </div>
  )
}
