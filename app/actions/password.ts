'use server'

import { redirect } from 'next/navigation'
import { InitialActionState } from '../helpers/getInitialActionState'
import { getMessageFromResponse } from '../helpers/getMessage'
import { resetPassword, updatePassword } from '../lib/password'

export async function resetPasswordAction(
  _prevState: InitialActionState,
  formData: FormData
) {
  const response = await updatePassword({
    token: formData.get('token') as string,
    password: formData.get('new-password') as string,
  })

  if (!response.ok) {
    return {
      data: null,
      errors: [getMessageFromResponse(response)],
    }
  }

  redirect('/account/login')
}

export async function forgotPasswordAction(
  _prevState: InitialActionState,
  formData: FormData
) {
  const response = await resetPassword({
    email: formData.get('email') as string,
  })

  if (!response.ok) {
    return {
      data: null,
      errors: [getMessageFromResponse(response)],
    }
  }

  const token = await response.json()

  redirect(`/account/reset-password?token=${token}`)
}
