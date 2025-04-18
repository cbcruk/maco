import { Option } from 'effect'
import { Session } from '../components/Session'
import { CommitFormCreate } from './components/CommitFormCreate'
import { SessionFallback } from '../components/SessionFallback'

function Commit() {
  return (
    <Session>
      {(session) =>
        Option.fromNullable(session).pipe(
          Option.match({
            onSome: (session) => (
              <CommitFormCreate>
                <input
                  type="hidden"
                  name="user_id"
                  defaultValue={session.user?.id}
                />
              </CommitFormCreate>
            ),
            onNone: () => <SessionFallback />,
          })
        )
      }
    </Session>
  )
}

export default Commit
