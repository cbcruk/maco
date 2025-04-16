import { Match } from 'effect'
import { Session } from '../components/Session'
import { FormLogin } from './_components/FormLogin'
import { FormLogout } from './_components/FormLogout'
import { signIn } from '@/lib/auth'

async function Account() {
  return (
    <Session>
      {(session) => {
        return Match.value(session).pipe(
          Match.when(Match.null, () => (
            <FormLogin
              onSubmitAction={async () => {
                'use server'

                try {
                  await signIn('github', {
                    redirectTo: '/',
                  })
                } catch (e) {
                  throw e
                }
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
