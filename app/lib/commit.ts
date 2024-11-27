'use server'

import { createContentTypeHeaders } from '../helpers/createContentTypeHeaders'
import { createValTownUrl } from '../helpers/createValTownUrl'
import { DefaultActionState } from '../types'
import { getSession } from './auth'

export async function createCommit(
  _prevState: DefaultActionState,
  formData: FormData
) {
  const url = createValTownUrl('/api/commits')
  const headers = createContentTypeHeaders()
  const session = await getSession()
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      emoji: formData.get('emoji'),
      message: formData.get('message'),
      user_id: session.id,
    }),
    headers,
  })

  if (!response.ok) {
    return {
      message: '실패',
    }
  }

  return {
    message: '성공',
  }
}

export async function getCommits() {
  const session = await getSession()
  const url = createValTownUrl('/api/commits')
  url.searchParams.set('user_id', `${session.id}`)
  const response = await fetch(url)

  return response
}
