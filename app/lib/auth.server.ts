import { createContentTypeHeaders } from '~/helpers/createContentTypeHeaders'
import { createValTownUrl } from '~/helpers/createValTownUrl'
import { PasswordSchema, UserSchema } from '~/schema'

type AuthBody = Pick<UserSchema, 'email'> & {
  password: string
}

export async function auth(body: AuthBody) {
  const url = createValTownUrl('/api/auth')
  const headers = createContentTypeHeaders()
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  })

  return response
}

type ResetPasswordBody = Pick<UserSchema, 'email'>

export async function resetPassword(body: ResetPasswordBody) {
  const url = createValTownUrl(`/api/password/reset/${body.email}`)
  const response = await fetch(url, {
    method: 'PATCH',
  })

  return response
}

type UpdatePasswordBody = Pick<PasswordSchema, 'token'> & {
  password: string
}

export async function updatePassword(body: UpdatePasswordBody) {
  const url = createValTownUrl('/api/password/update')
  const headers = createContentTypeHeaders()
  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers,
  })

  return response
}
