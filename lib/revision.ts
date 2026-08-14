import { CommitRecord, CommitSchema } from '@/db/schema'
import { commitHash } from './hash'
import { issueHlc } from './device'
import { uuidv7 } from './uuid'

type RevisionBody = Pick<CommitSchema, 'emoji' | 'message'>

type RevisionBase = Pick<
  CommitSchema,
  'note_id' | 'parent_hash' | 'created' | 'emoji' | 'message' | 'deleted'
> & {
  user_id: CommitSchema['user_id']
}

/**
 * 리비전 하나를 만든다. 브라우저에서만 호출한다 — 논리 시계와 기기 식별자를
 * 로컬 저장소에서 발급받기 때문이다.
 *
 * `user_id`는 해시 계산에만 쓰고 레코드에는 담지 않는다. 서버가 세션에서
 * 가져온 값으로 해시를 다시 계산해 검증한다.
 */
async function buildRevision({
  user_id,
  ...base
}: RevisionBase): Promise<CommitRecord> {
  const { device_id, hlc } = issueHlc()
  const record = { ...base, device_id, hlc }

  return {
    ...record,
    hash: await commitHash({ ...record, user_id }),
  }
}

export function createRevision({
  user_id,
  emoji,
  message,
  now = new Date(),
}: RevisionBody & { user_id: string; now?: Date }) {
  return buildRevision({
    user_id,
    note_id: uuidv7(now.getTime()),
    parent_hash: null,
    created: now.toISOString(),
    emoji,
    message,
    deleted: false,
  })
}

/**
 * 수정 = 같은 `note_id`에 리비전을 하나 더 쌓는 것. 이전 내용은 남는다.
 * `created`는 메모가 처음 작성된 시각이므로 그대로 물려받는다.
 */
export function amendRevision({
  user_id,
  current,
  emoji,
  message,
}: RevisionBody & { user_id: string; current: CommitSchema }) {
  return buildRevision({
    user_id,
    note_id: current.note_id,
    parent_hash: current.hash,
    created: current.created,
    emoji,
    message,
    deleted: false,
  })
}

/**
 * 삭제 = `deleted`가 참인 리비전(톰스톤). 행을 지우면 오프라인에서 지운
 * 메모가 다음 동기화 때 되살아난다.
 */
export function tombstoneRevision({
  user_id,
  current,
}: {
  user_id: string
  current: CommitSchema
}) {
  return buildRevision({
    user_id,
    note_id: current.note_id,
    parent_hash: current.hash,
    created: current.created,
    emoji: current.emoji,
    message: current.message,
    deleted: true,
  })
}
