import { createContentTypeHeaders } from '../helpers/createContentTypeHeaders'
import { createValTownUrl } from '../helpers/createValTownUrl'
import { CommitSchema } from '../schema'
import { getSession } from './auth'

export async function getCommits() {
  const session = await getSession()
  const url = createValTownUrl('/api/commits')
  url.searchParams.set('user_id', `${session.id}`)
  const response = await fetch(url)

  return response
}

type GetCommitParams = {
  id: string
}

export async function getCommit({ id }: GetCommitParams) {
  const session = await getSession()
  const url = createValTownUrl(`/api/commits/${id}`)
  url.searchParams.set('user_id', `${session.id}`)
  const response = await fetch(url)

  return response
}

export async function getLatestCommit() {
  const session = await getSession()
  const url = createValTownUrl('/api/commits/latest')
  url.searchParams.set('user_id', `${session.id}`)
  const response = await fetch(url)

  return response
}

type CreateCommitBody = Omit<CommitSchema, 'id' | 'created' | 'updated'>

export async function createCommit(body: CreateCommitBody) {
  const url = createValTownUrl('/api/commits')
  const headers = createContentTypeHeaders()
  const session = await getSession()
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      ...body,
      user_id: session.id,
    }),
    headers,
  })

  return response
}

type UpdateCommitBody = Pick<CommitSchema, 'emoji' | 'message'>

export async function updateCommit(id: string, body: UpdateCommitBody) {
  const url = createValTownUrl(`/api/commits/${id}`)
  const headers = createContentTypeHeaders()
  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers,
  })

  return response
}
