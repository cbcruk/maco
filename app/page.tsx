import { getCommits } from './lib/commit'
import { CommitSchema } from './schema'
import { CommitList } from './components/CommitList'
import { getSession } from './lib/auth'
import { WarnMessage } from './components/WarnMessage'
import Link from 'next/link'

async function Home() {
  const session = await getSession()

  if (!session.isLoggedIn) {
    return (
      <div className="px-4">
        <WarnMessage>
          로그인한 사용자만 확인할 수 있습니다.&nbsp;
          <Link href="/account/login" className="underline">
            로그인
          </Link>
          을 완료하고 다시 시도해주세요.
        </WarnMessage>
      </div>
    )
  }

  const commitResponse = await getCommits()

  if (!commitResponse.ok) {
    return null
  }

  const data = (await commitResponse.json()) as CommitSchema[]

  return <CommitList list={data} />
}

export default Home
