import { ComponentProps } from 'react'
import { FormLogin } from '../../account/_components/FormLogin'
import { FormLogout } from '../../account/_components/FormLogout'
import { FormSubmit } from '../../account/_components/FormSubmit'
import { PersonIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import { merge } from '@/lib/classNames'

function AppNavAccountFormSubmit({
  children,
  className,
}: ComponentProps<'button'>) {
  return (
    <FormSubmit className={merge('hover:font-bold', className)}>
      {children}
    </FormSubmit>
  )
}

export function AppNavAccountFormLogin() {
  return (
    <FormLogin className="flex">
      <AppNavAccountFormSubmit>
        <PersonIcon />
      </AppNavAccountFormSubmit>
    </FormLogin>
  )
}

export function AppNavAccountFormLogout() {
  return (
    <FormLogout>
      <AppNavAccountFormSubmit className="flex items-center gap-2">
        로그아웃
      </AppNavAccountFormSubmit>
    </FormLogout>
  )
}

export function AppNavAccountForm() {
  return (
    <div className="flex flex-col gap-4 p-2 bg-gray-900 rounded-lg">
      <Link href="/account" className="flex items-center gap-2 hover:font-bold">
        계정정보
      </Link>
      <AppNavAccountFormLogout />
    </div>
  )
}
