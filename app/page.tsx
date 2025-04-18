import { CommitList } from './components/CommitList'
import { SessionWithUserId } from './components/Session'
import { CommitListServer } from './components/CommitList.server'
import { CommitListNav } from './components/CommitListNav'
import { HomeProps } from './types'
import { SessionFallback } from './components/SessionFallback'

async function Home({ searchParams }: HomeProps) {
  const { date } = await searchParams

  return (
    <SessionWithUserId
      fallback={
        <div className="p-4">
          <SessionFallback />
        </div>
      }
    >
      {({ id: user_id }) => (
        <>
          <CommitListNav />
          <CommitListServer params={{ date, user_id }}>
            {(data) => <CommitList list={data} />}
          </CommitListServer>
        </>
      )}
    </SessionWithUserId>
  )
}

export default Home
