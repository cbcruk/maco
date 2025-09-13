import { CommitList } from './components/CommitList'
import { Session } from './components/Session'
import { CommitListServer } from './components/CommitList.server'
import { CommitListNav } from './components/CommitListNav'
import { HomeProps } from './types'
import { getServerTimezone } from '@/lib/timezone'
import { TimezoneProvider } from './context'

async function Home({ searchParams }: HomeProps) {
  const { date } = await searchParams
  const timezone = await getServerTimezone()

  return (
    <Session>
      {() => (
        <TimezoneProvider value={{ timezone }}>
          <CommitListNav />
          <CommitListServer params={{ date }}>
            {(data) => <CommitList list={data} />}
          </CommitListServer>
        </TimezoneProvider>
      )}
    </Session>
  )
}

export default Home
