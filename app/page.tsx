import { CommitList } from './components/CommitList'
import { Session } from './components/Session'
import { CommitListServer } from './components/CommitList.server'
import { CommitListNav } from './components/CommitListNav'
import { HomeProps } from './types'
import { Option } from 'effect'
import { SessionFallback } from './components/SessionFallback'

async function Home({ searchParams }: HomeProps) {
  const { date } = await searchParams

  return (
    <Session>
      {(session) => {
        return Option.fromNullable(session?.user).pipe(
          Option.match({
            onNone: () => (
              <div className="p-4">
                <SessionFallback />
              </div>
            ),
            onSome: (user) => (
              <>
                <CommitListNav />
                <CommitListServer params={{ date, user_id: user.id }}>
                  {(data) => <CommitList list={data} />}
                </CommitListServer>
              </>
            ),
          })
        )
      }}
    </Session>
  )
}

export default Home
