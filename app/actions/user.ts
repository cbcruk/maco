'use server'

import { revalidatePath } from 'next/cache'
import { redirect, RedirectType } from 'next/navigation'
import { createUser, deleteUser } from '../lib/user'
import { getMessageFromResponse } from '../helpers/getMessage'
import { InitialActionState } from '../helpers/getInitialActionState'
import { getSession } from '../lib/auth'

export async function createUserAction(
  _prevState: InitialActionState,
  formData: FormData
) {
  const response = await createUser({
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (!response.ok) {
    return {
      data: null,
      errors: [getMessageFromResponse(response)],
    }
  }

  revalidatePath('/')

  redirect('/account/login')
}

export async function deleteUserAction() {
  const session = await getSession()
  const response = await deleteUser({
    id: session.id!,
  })

  if (!response.ok) {
    return {
      data: null,
      errors: [getMessageFromResponse(response)],
    }
  }

  session.destroy()

  revalidatePath('/')

  redirect('/', RedirectType.replace)
}
