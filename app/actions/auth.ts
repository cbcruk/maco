'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession, login } from '../lib/auth'
import { getMessageFromResponse } from '../helpers/getMessage'
import { InitialActionState } from '../helpers/getInitialActionState'

export async function loginAction(
  _prevState: InitialActionState,
  formData: FormData
) {
  const response = await login({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (!response.ok) {
    return {
      data: null,
      errors: [getMessageFromResponse(response)],
    }
  }

  const data = await response.json()
  const session = await getSession()

  session.id = data.id
  session.isLoggedIn = true

  await session.save()

  revalidatePath('/')

  redirect('/')
}

export async function logoutAction() {
  const session = await getSession()

  session.destroy()

  revalidatePath('/')

  redirect('/')
}
