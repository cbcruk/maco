'use client'

import { signOut } from 'next-auth/react'
import { FormSubmit } from './FormSubmit'
import { useActionState } from 'react'

export function FormLogout() {
  const [, formAction] = useActionState(() => signOut(), false)

  return (
    <form action={formAction}>
      <FormSubmit>로그아웃</FormSubmit>
    </form>
  )
}
