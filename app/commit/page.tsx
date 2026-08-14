import { Option } from 'effect'
import { Session } from '../components/Session'
import { CommitFormCreate } from './components/CommitFormCreate'
import { SessionFallback } from '../components/SessionFallback'

function Commit() {
  return (
    <Session>
      {(session) =>
        Option.fromNullable(session?.user?.id).pipe(
          Option.match({
            onSome: (userId) => <CommitFormCreate userId={userId} />,
            onNone: () => <SessionFallback />,
          })
        )
      }
    </Session>
  )
}

export default Commit
