'use client'

import { resetPasswordAction } from '@/app/actions/password'
import { Button } from '@/app/components/Button'
import { ErrorMessage } from '@/app/components/ErrorMessage'
import { Input } from '@/app/components/Input'
import { getInitialActionState } from '@/app/helpers/getInitialActionState'
import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    getInitialActionState()
  )

  return (
    <form action={formAction}>
      <fieldset disabled={isPending} className="w-min">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <input type="hidden" name="token" value={token} />
            <Input
              name="new-password"
              type="password"
              placeholder="새로운 비밀번호"
            />
            <Input
              name="confirm-password"
              type="password"
              placeholder="새로운 비밀번호 확인"
            />
          </div>
          <ErrorMessage errors={state.errors} />
          <div className="flex">
            <Button type="submit">저장</Button>
          </div>
        </div>
      </fieldset>
    </form>
  )
}
