import { createContentTypeHeaders } from '~/helpers/createContentTypeHeaders'
import { createValTownUrl } from '~/helpers/createValTownUrl'
import { UserSchema } from '~/schema'

export async function createUser(
  body: Pick<UserSchema, 'name' | 'email'> & { password: string }
) {
  const url = createValTownUrl('/api/users')
  const headers = createContentTypeHeaders()
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  })

  return response
}

export async function deleteUser(body: Pick<UserSchema, 'id'>) {
  const url = createValTownUrl(`/api/users/${body.id}`)
  const response = await fetch(url, {
    method: 'DELETE',
  })

  return response
}

export async function getUser(body: Pick<UserSchema, 'id'>) {
  const url = createValTownUrl(`/api/users/${body.id}`)
  const response = await fetch(url)

  return response
}

export async function findUser(body: Pick<UserSchema, 'email'>) {
  const url = createValTownUrl(`/api/users`)
  url.searchParams.set('email', body.email)
  const response = await fetch(url)

  return response
}
