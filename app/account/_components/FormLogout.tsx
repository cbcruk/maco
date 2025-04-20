'use client'

import { signOut } from 'next-auth/react'
import { PropsWithChildren, useActionState } from 'react'

export function FormLogout({ children }: PropsWithChildren) {
  const [, formAction] = useActionState(() => signOut(), false)

  return <form action={formAction}>{children}</form>
}
