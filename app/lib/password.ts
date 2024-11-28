'use server'

import { createContentTypeHeaders } from '../helpers/createContentTypeHeaders'
import { createValTownUrl } from '../helpers/createValTownUrl'
import { UserSchema, PasswordSchema } from '../schema'

type ResetPasswordBody = Pick<UserSchema, 'email'>

export async function resetPassword(body: ResetPasswordBody) {
  const url = createValTownUrl('/api/password/reset')
  const headers = createContentTypeHeaders()
  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers,
  })

  return response
}

type UpdatePasswordBody = Pick<PasswordSchema, 'token'> & {
  password: string
}

export async function updatePassword(body: UpdatePasswordBody) {
  const url = createValTownUrl('/api/password')
  const headers = createContentTypeHeaders()
  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers,
  })

  return response
}
