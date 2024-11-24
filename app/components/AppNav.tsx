import { ComponentProps } from 'react'
import { NavLink, useRouteLoaderData } from 'react-router'
import type { Info } from '../+types/root'

function AppNavLink({ children, ...props }: ComponentProps<typeof NavLink>) {
  return (
    <NavLink
      className="text-xs hover:font-bold aria-[current=page]:font-bold aria-[current=page]:underline"
      {...props}
    >
      {children}
    </NavLink>
  )
}

export function AppNav() {
  const { isLogin } = useRouteLoaderData('root') as Info['loaderData']

  return (
    <div className="flex gap-2 p-4">
      <AppNavLink to="/">홈</AppNavLink>
      {isLogin ? (
        <>
          <AppNavLink to="/commit">쓰기</AppNavLink>
          <AppNavLink to="/signout">로그아웃</AppNavLink>
        </>
      ) : (
        <>
          <AppNavLink to="/signin">로그인</AppNavLink>
          <AppNavLink to="/signup">가입</AppNavLink>
        </>
      )}
    </div>
  )
}
