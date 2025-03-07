import { CommitList } from './components/CommitList'
import { WarnMessage } from './components/WarnMessage'
import { Link } from 'react-transition-progress/next'
import { Session } from './components/Session'
import { CommitListServer } from './components/CommitList.server'
import { HomeBodyProps, HomeProps } from './types'
import { CommitListNav } from './components/CommitListNav'

function HomeBody({ isLoggedIn, children }: HomeBodyProps) {
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

  return children
}

async function Home({ searchParams }: HomeProps) {
  const { date } = await searchParams

  return (
    <Session>
      {(props) => (
        <HomeBody {...props}>
          <CommitListNav />
          <CommitListServer {...{ date }}>
            {(data) => <CommitList list={data} />}
          </CommitListServer>
        </HomeBody>
      )}
    </Session>
  )
}

export default Home
