'use client'

import { forgotPasswordAction } from '@/app/actions/password'
import { Button } from '@/app/components/Button'
import { ErrorMessage } from '@/app/components/ErrorMessage'
import { Input } from '@/app/components/Input'
import { getInitialActionState } from '@/app/helpers/getInitialActionState'
import { useActionState } from 'react'

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    getInitialActionState()
  )

  return (
    <form action={formAction}>
      <fieldset disabled={isPending} className="w-min">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Input
              name="email"
              type="text"
              placeholder="이메일을 입력해 주세요"
              required
            />
          </div>
          {state.data === '200' && (
            <p
              aria-live="polite"
              className="leading-4 break-keep whitespace-nowrap"
            >
              <strong>링크를 전송했습니다</strong>
              <br />
              확인 링크를 받았는지 이메일을 확인해 주세요. 새 링크를 요청하려면
              이메일을 다시 입력하세요.
            </p>
          )}
          <ErrorMessage errors={state.errors} />
          <div className="flex">
            <Button type="submit">확인</Button>
          </div>
        </div>
      </fieldset>
    </form>
  )
}
