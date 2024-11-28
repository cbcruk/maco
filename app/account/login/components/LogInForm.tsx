'use client'

import { loginAction } from '@/app/actions/auth'
import { Button } from '@/app/components/Button'
import { ErrorMessage } from '@/app/components/ErrorMessage'
import { Input } from '@/app/components/Input'
import { getInitialActionState } from '@/app/helpers/getInitialActionState'
import { useActionState } from 'react'

export function LogInForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    getInitialActionState()
  )

  return (
    <form action={formAction}>
      <fieldset disabled={isPending} className="w-min">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Input
              type="email"
              name="email"
              placeholder="이메일을 입력해 주세요"
              defaultValue=""
            />
            <Input
              type="password"
              name="password"
              placeholder="비밀번호를 입력해 주세요"
              defaultValue=""
            />
          </div>
          <ErrorMessage errors={state.errors} />
          <div className="flex">
            <Button type="submit">로그인</Button>
          </div>
        </div>
      </fieldset>
    </form>
  )
}
