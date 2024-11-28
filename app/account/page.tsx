import Link from 'next/link'
import { getSession } from '../lib/auth'
import { redirect } from 'next/navigation'
import { ComponentProps, Fragment } from 'react'

async function LoggedIn({ children }: ComponentProps<typeof Fragment>) {
  const session = await getSession()

  if (!session.isLoggedIn) {
    redirect('/')
  }

  return <>{children}</>
}

async function Account() {
  return (
    <LoggedIn>
      <div className="flex gap-2">
        <Link href="/account/logout">로그아웃</Link>
        <Link href="/account/forgot-password">비밀번호 변경</Link>
        <Link href="/account/delete">탈퇴</Link>
      </div>
    </LoggedIn>
  )
}

export default Account
