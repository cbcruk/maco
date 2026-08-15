import { Suspense } from 'react'
import { CommitList } from './components/CommitList'
import { Session } from './components/Session'
import { CommitListServer } from './components/CommitList.server'
import { CommitListNav } from './components/CommitListNav'
import { HomeProps } from './types'

/**
 * 세션과 DB를 기다리는 부분. `searchParams`도 여기서 풀어야 한다 —
 * 바깥에서 `await`하면 월 이동 네비게이션까지 함께 멈춘다.
 */
async function HomeList({ searchParams }: HomeProps) {
  const { date } = await searchParams

  return (
    <Session>
      {() => (
        <CommitListServer params={{ date }}>
          {(data) => <CommitList list={data} />}
        </CommitListServer>
      )}
    </Session>
  )
}

function Home({ searchParams }: HomeProps) {
  return (
    <>
      {/* `useSearchParams()`를 쓰는 컴포넌트는 자체 경계가 필요하다.
          없으면 서버에서 렌더되지 않고 클라이언트로 넘어간다. */}
      <Suspense fallback={null}>
        <CommitListNav />
      </Suspense>
      <Suspense fallback={null}>
        <HomeList searchParams={searchParams} />
      </Suspense>
    </>
  )
}

export default Home
