import { CommitList } from './components/CommitList'
import { Session } from './components/Session'
import { CommitListServer } from './components/CommitList.server'
import { CommitListNav } from './components/CommitListNav'
import { HomeProps } from './types'
import { SessionFallback } from './components/SessionFallback'
import { Option } from 'effect'

async function Home({ searchParams }: HomeProps) {
  const { date } = await searchParams

  return (
    <Session>
      {(session) =>
        Option.fromNullable(session).pipe(
          Option.match({
            onNone() {
              return (
                <div className="p-4">
                  <SessionFallback />
                </div>
              )
            },
            onSome() {
              return (
                <>
                  <CommitListNav />
                  <CommitListServer params={{ date }}>
                    {(data) => <CommitList list={data} />}
                  </CommitListServer>
                </>
              )
            },
          })
        )
      }
    </Session>
  )
}

export default Home
