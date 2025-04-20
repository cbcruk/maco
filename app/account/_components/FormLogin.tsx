import { ComponentProps, useActionState } from 'react'
import { signIn } from 'next-auth/react'

export function FormLogin({ children, ...props }: ComponentProps<'form'>) {
  const [, formAction] = useActionState(
    async () =>
      signIn('github', {
        redirectTo: '/',
      }),
    undefined
  )

  return (
    <form action={formAction} {...props}>
      {children}
    </form>
  )
}
