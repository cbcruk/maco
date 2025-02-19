import { Link } from 'react-transition-progress/next'
import { redirect } from 'next/navigation'
import { Session } from '../components/Session'

async function Account() {
  return (
    <Session>
      {({ isLoggedIn }) => {
        if (!isLoggedIn) {
          redirect('/')
        }

        return (
          <div className="flex gap-2">
            <Link prefetch href="/account/logout">
              로그아웃
            </Link>
            <Link prefetch href="/account/forgot-password">
              비밀번호 변경
            </Link>
            <Link prefetch href="/account/delete">
              탈퇴
            </Link>
          </div>
        )
      }}
    </Session>
  )
}

export default Account
