import { CommitList } from './components/CommitList'
import { WarnMessage } from './components/WarnMessage'
import { Link } from 'react-transition-progress/next'
import { GetSessionReturn, Session } from './components/Session'
import { CommitListServer } from './components/CommitList.server'
import { Suspense } from 'react'

type HomeBodyProps = GetSessionReturn

function HomeBody({ isLoggedIn }: HomeBodyProps) {
  if (!isLoggedIn) {
    return (
      <div className="px-4">
        <WarnMessage>
          로그인한 사용자만 확인할 수 있습니다.&nbsp;
          <Link prefetch href="/account/login" className="underline">
            로그인
          </Link>
          을 완료하고 다시 시도해주세요.
        </WarnMessage>
      </div>
    )
  }

  return (
    <Suspense fallback={null}>
      <CommitListServer>
        {(data) => <CommitList list={data} />}
      </CommitListServer>
    </Suspense>
  )
}

async function Home() {
  return <Session>{HomeBody}</Session>
}

export default Home
