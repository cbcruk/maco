import { notFound } from 'next/navigation'
import { isUuid } from '@/lib/uuid'
import { CommitDetailProps, NoteId } from './types'

/**
 * 세 화면(스레드/수정/이력)이 같은 주소 규칙을 쓴다. UUID 가 아니면 조회를
 * 시도하지 않고 404 로 답한다.
 */
export async function getNoteId(
  params: CommitDetailProps['params']
): Promise<NoteId> {
  const { id } = await params

  if (!isUuid(id)) {
    notFound()
  }

  return { note_id: id }
}
