'use client'

import { Option } from 'effect'
import { FormLogin } from './_components/FormLogin'
import { FormLogout } from './_components/FormLogout'
import { useSession } from 'next-auth/react'
import { Suspense } from 'react'

function Account() {
  const session = useSession()

  return (
    <Suspense>
      {Option.fromNullable(session.data).pipe(
        Option.match({
          onSome: () => <FormLogout />,
          onNone: () => <FormLogin />,
        })
      )}
    </Suspense>
  )
}

export default Account
