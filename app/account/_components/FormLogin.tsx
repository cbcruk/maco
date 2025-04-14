import { FormHTMLAttributes } from 'react'
import { FormSubmit } from './FormSubmit'

type FormLoginProps = {
  onSubmitAction: FormHTMLAttributes<HTMLFormElement>['action']
}

export function FormLogin({ onSubmitAction }: FormLoginProps) {
  return (
    <form action={onSubmitAction}>
      <FormSubmit>로그인</FormSubmit>
    </form>
  )
}
