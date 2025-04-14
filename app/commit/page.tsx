import { Session } from '../components/Session'
import { CommitFormCreate } from './components/CommitFormCreate'

async function Commit() {
  return (
    <Session>
      {(session) => {
        return (
          <CommitFormCreate>
            <input
              type="hidden"
              name="user_id"
              defaultValue={session?.user?.id}
            />
          </CommitFormCreate>
        )
      }}
    </Session>
  )
}

export default Commit
