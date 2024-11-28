'use client'

import { forgotPasswordAction } from '@/app/actions/password'
import { Button } from '@/app/components/Button'
import { ErrorMessage } from '@/app/components/ErrorMessage'
import { Input } from '@/app/components/Input'
import { getInitialActionState } from '@/app/helpers/getInitialActionState'
import { UserSchema } from '@/app/schema'
import { useActionState } from 'react'

type ForgotPasswordFormProps = Pick<UserSchema, 'email'>

export function ForgotPasswordForm({ email }: ForgotPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    getInitialActionState()
  )

  return (
    <form action={formAction}>
      <fieldset disabled={isPending} className="w-min">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Input name="email" type="text" defaultValue={email} />
          </div>
          <ErrorMessage errors={state.errors} />
          <div className="flex">
            <Button type="submit">확인</Button>
          </div>
        </div>
      </fieldset>
    </form>
  )
}
