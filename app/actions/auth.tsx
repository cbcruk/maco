import { revalidatePath } from 'next/cache'
import { createContentTypeHeaders } from '../helpers/createContentTypeHeaders'
import { createValTownUrl } from '../helpers/createValTownUrl'
import { getSession } from '../lib/auth'

export async function logout() {
  'use server'

  const session = await getSession()

  session.destroy()

  revalidatePath('/')
}

export async function login(formData: FormData) {
  'use server'

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
    throw response
  }

  const data = await response.json()
  const session = await getSession()

  console.log('data', data)

  session.id = data.id
  session.isLoggedIn = true

  await session.save()

  revalidatePath('/')
}
