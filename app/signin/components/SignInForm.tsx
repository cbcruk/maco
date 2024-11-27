'use client'

import { Button } from '@/app/components/Button'
import { Input } from '@/app/components/Input'
import { useActionState } from 'react'
import { login } from '../actions'

export function SignInForm() {
  const [, formAction, isPending] = useActionState(login, {
    message: '',
  })

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
          <div className="flex">
            <Button type="submit">로그인</Button>
          </div>
        </div>
      </fieldset>
    </form>
  )
}
