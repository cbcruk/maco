import { Match } from 'effect'
import { Session } from '../components/Session'
import { CommitFormCreate } from './components/CommitFormCreate'
import { SessionFallback } from '../components/SessionFallback'

function Commit() {
  return (
    <Session>
      {(session) => {
        return Match.value(session?.user).pipe(
          Match.when(Match.undefined, () => <SessionFallback />),
          Match.orElse(() => (
            <CommitFormCreate>
              <input
                type="hidden"
                name="user_id"
                defaultValue={session?.user?.id}
              />
            </CommitFormCreate>
          ))
        )
      }}
    </Session>
  )
}

export default Commit
