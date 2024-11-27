'use server'

import { revalidatePath } from 'next/cache'
import { createContentTypeHeaders } from '../helpers/createContentTypeHeaders'
import { createValTownUrl } from '../helpers/createValTownUrl'
import { getSession } from '../lib/auth'
import { redirect } from 'next/navigation'

export async function login(
  _prevState: { message: string },
  formData: FormData
) {
  const url = createValTownUrl('/api/auth')
  const headers = createContentTypeHeaders()
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
    }),
    headers,
  })

  if (!response.ok) {
    return { message: 'error' }
  }

  const data = await response.json()
  const session = await getSession()

  session.id = data.id
  session.isLoggedIn = true

  await session.save()

  revalidatePath('/')

  redirect('/')
}
