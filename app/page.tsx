import { CommitList } from './components/CommitList'
import { Message } from './components/Message'
import { Link } from 'react-transition-progress/next'
import { Session } from './components/Session'
import { CommitListServer } from './components/CommitList.server'
import { CommitListNav } from './components/CommitListNav'
import { HomeProps } from './types'
import { Match } from 'effect'

function HomeSessionFallback() {
  return (
    <div className="px-4">
      <Message>
        로그인한 사용자만 확인할 수 있습니다.&nbsp;
        <Link prefetch href="/account" className="underline">
          로그인
        </Link>
        을 완료하고 다시 시도해주세요.
      </Message>
    </div>
  )
}

async function Home({ searchParams }: HomeProps) {
  const { date } = await searchParams

  return (
    <Session>
      {(session) => {
        return Match.value(session?.user).pipe(
          Match.when(Match.undefined, () => <HomeSessionFallback />),
          Match.orElse((user) => (
            <>
              <CommitListNav />
              <CommitListServer params={{ date, user_id: user.id }}>
                {(data) => <CommitList list={data} />}
              </CommitListServer>
            </>
          ))
        )
      }}
    </Session>
  )
}

export default Home
