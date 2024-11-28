'use client'

import { createUserAction } from '@/app/actions/user'
import { Button } from '@/app/components/Button'
import { ErrorMessage } from '@/app/components/ErrorMessage'
import { Input } from '@/app/components/Input'
import { getInitialActionState } from '@/app/helpers/getInitialActionState'
import { useActionState } from 'react'

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(
    createUserAction,
    getInitialActionState()
  )

  return (
    <form action={formAction}>
      <fieldset disabled={isPending} className="flex flex-col gap-4 w-min">
        <div className="flex flex-col gap-2">
          <Input
            name="name"
            type="text"
            placeholder="이름을 입력해 주세요"
            defaultValue=""
          />
          <Input
            name="email"
            type="email"
            placeholder="이메일을 입력해 주세요"
            defaultValue=""
          />
          <Input
            name="password"
            type="password"
            placeholder="비밀번호를 입력해 주세요"
            defaultValue=""
          />
        </div>
        <ErrorMessage errors={state.errors} />
        <div className="flex">
          <Button type="submit">가입</Button>
        </div>
      </fieldset>
    </form>
  )
}
