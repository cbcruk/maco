import { Match } from 'effect'
import { signIn } from '@/lib/auth'
import { Session } from '../components/Session'
import { FormLogin } from './_components/FormLogin'
import { FormLogout } from './_components/FormLogout'

async function Account() {
  return (
    <Session>
      {(session) => {
        return Match.value(session).pipe(
          Match.when(Match.null, () => (
            <FormLogin
              onSubmitAction={async () => {
                'use server'

                await signIn('github', {
                  redirectTo: '/',
                })
              }}
            />
          )),
          Match.orElse(() => <FormLogout />)
        )
      }}
    </Session>
  )
}

export default Account
