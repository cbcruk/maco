import { CommitRecord, CommitSchema } from '@/db/schema'
import { commitHash } from './hash'
import { issueHlc } from './device'
import { uuidv7 } from './uuid'

type RevisionBody = Pick<CommitSchema, 'emoji' | 'message'>

type RevisionBase = Pick<
  CommitSchema,
  | 'note_id'
  | 'parent_hash'
  | 'created'
  | 'emoji'
  | 'message'
  | 'deleted'
  | 'reply_to_note_id'
  | 'reply_to_hash'
  | 'root_note_id'
  | 'depth'
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

/**
 * 대상 리비전. `user_id`는 필요 없으므로 빼 둔다 — 그래야 화면이 들고 있는
 * `CommitView`(서버 행이든 아웃박스 항목이든)를 그대로 넘길 수 있다.
 */
type RevisionTarget = Omit<CommitSchema, 'user_id'>

/**
 * 같은 메모의 다음 리비전이 물려받는 것들. 수정·삭제는 내용만 바꿀 뿐
 * 스레드에서의 위치와 최초 작성 시각은 그대로다.
 */
function inherit(current: RevisionTarget) {
  return {
    note_id: current.note_id,
    parent_hash: current.hash,
    created: current.created,
    reply_to_note_id: current.reply_to_note_id,
    reply_to_hash: current.reply_to_hash,
    root_note_id: current.root_note_id,
    depth: current.depth,
  }
}

export function createRevision({
  user_id,
  emoji,
  message,
  now = new Date(),
}: RevisionBody & { user_id: string; now?: Date }) {
  const note_id = uuidv7(now.getTime())

  return buildRevision({
    user_id,
    note_id,
    parent_hash: null,
    created: now.toISOString(),
    emoji,
    message,
    deleted: false,
    reply_to_note_id: null,
    reply_to_hash: null,
    root_note_id: note_id,
    depth: 0,
  })
}

/**
 * 이어 쓰기 = 새 메모를 만들되 어떤 메모에 매달아 둔다.
 *
 * `reply_to_note_id`는 **메모**를 가리키고 `reply_to_hash`는 이어 쓸 당시의
 * 리비전을 남긴다. 구조는 메모 단위라 원본을 수정해도 답글이 떨어지지 않고,
 * 출처가 남아 있어 "달린 뒤 원본이 수정되었다"를 알 수 있다.
 */
export function replyRevision({
  user_id,
  parent,
  emoji,
  message,
  now = new Date(),
}: RevisionBody & {
  user_id: string
  parent: RevisionTarget
  now?: Date
}) {
  return buildRevision({
    user_id,
    note_id: uuidv7(now.getTime()),
    parent_hash: null,
    created: now.toISOString(),
    emoji,
    message,
    deleted: false,
    reply_to_note_id: parent.note_id,
    reply_to_hash: parent.hash,
    root_note_id: parent.root_note_id,
    depth: parent.depth + 1,
  })
}

/**
 * 수정 = 같은 `note_id`에 리비전을 하나 더 쌓는 것. 이전 내용은 남는다.
 */
export function amendRevision({
  user_id,
  current,
  emoji,
  message,
}: RevisionBody & { user_id: string; current: RevisionTarget }) {
  return buildRevision({
    user_id,
    ...inherit(current),
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
  current: RevisionTarget
}) {
  return buildRevision({
    user_id,
    ...inherit(current),
    emoji: current.emoji,
    message: current.message,
    deleted: true,
  })
}
