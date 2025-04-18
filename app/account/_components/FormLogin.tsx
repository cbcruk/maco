import { useActionState } from 'react'
import { FormSubmit } from './FormSubmit'
import { signIn } from 'next-auth/react'

export function FormLogin() {
  const [, formAction] = useActionState(
    () =>
      signIn('github', {
        redirectTo: '/',
      }),
    undefined
  )

  return (
    <form action={formAction}>
      <FormSubmit>로그인</FormSubmit>
    </form>
  )
}
