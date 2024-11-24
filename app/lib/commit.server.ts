import { createContentTypeHeaders } from '~/helpers/createContentTypeHeaders'
import { createValTownUrl } from '~/helpers/createValTownUrl'
import { CommitSchema, UserSchema } from '~/schema'

type CreateCommitBody = Omit<CommitSchema, 'id' | 'created' | 'updated'> & {
  user_id: UserSchema['id']
}

export async function createCommit(body: CreateCommitBody) {
  const url = createValTownUrl('/api/commits')
  const headers = createContentTypeHeaders()
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  })

  return response
}

export async function getCommits(body: Pick<UserSchema, 'id'>) {
  const url = createValTownUrl('/api/commits')
  url.searchParams.set('user_id', `${body.id}`)
  const response = await fetch(url)

  return response
}
