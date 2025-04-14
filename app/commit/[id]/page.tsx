import { getCommit } from '@/lib/commit'
import { CommitFormEdit } from '../components/CommitFormEdit'
import { Match } from 'effect'
import { Session } from '@/app/components/Session'

type CommitDetailProps = { params: Promise<{ id: string }> }

async function CommitDetail({ params }: CommitDetailProps) {
  const { id } = await params

  return (
    <Session>
      {(session) => {
        return Match.value(session?.user?.id).pipe(
          Match.when(Match.undefined, () => null),
          Match.orElse(async (user_id) => {
            const data = await getCommit({ id: parseInt(id, 10), user_id })

            return Match.value(data).pipe(
              Match.when(Match.undefined, () => null),
              Match.orElse((data) => (
                <CommitFormEdit
                  defaultValues={{
                    emoji: data.emoji,
                    message: data.message,
                  }}
                >
                  <input type="hidden" name="id" defaultValue={id} />
                </CommitFormEdit>
              ))
            )
          })
        )
      }}
    </Session>
  )
}

export default CommitDetail
