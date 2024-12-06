import { getCommit } from '@/app/lib/commit'
import { CommitForm } from '../components/CommitForm'
import { CommitSchema } from '@/app/schema'
import { CommitFormEdit } from '../components/CommitFormEdit'

type CommitDetailProps = { params: Promise<{ id: string }> }

async function CommitDetail({ params }: CommitDetailProps) {
  const { id } = await params
  const commitResponse = await getCommit({ id })

  if (!commitResponse.ok) {
    return null
  }

  const data = (await commitResponse.json()) as CommitSchema

  const formData = new FormData()
  formData.set('emoji', data.emoji)
  formData.set('message', data.message)

  return (
    <CommitFormEdit formData={formData}>
      <input type="hidden" name="id" defaultValue={id} />
    </CommitFormEdit>
  )
}

export default CommitDetail
