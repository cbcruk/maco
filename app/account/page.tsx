'use client'

import { Match, Option } from 'effect'
import { FormLogin } from './_components/FormLogin'
import { useSession } from 'next-auth/react'
import { FormUser } from './_components/FormUser'
import { FormSubmit } from './_components/FormSubmit'

function Account() {
  const session = useSession()

  return (
    <>
      {Match.value(session.status).pipe(
        Match.when('authenticated', () =>
          Option.fromNullable(session.data?.user).pipe(
            Option.match({
              onSome: (user) => (
                <div className="flex flex-col gap-4">
                  <FormUser data={user} />
                </div>
              ),
              onNone: () => null,
            })
          )
        ),
        Match.when('unauthenticated', () => (
          <FormLogin>
            <FormSubmit className="rounded-lg p-1 font-medium hover:font-bold hover:shadow-lg bg-emerald-600">
              로그인
            </FormSubmit>
          </FormLogin>
        )),
        Match.orElse(() => <pre>로딩중...</pre>)
      )}
    </>
  )
}

export default Account
