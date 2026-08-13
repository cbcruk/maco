const encoder = new TextEncoder()

export type CommitHashInput = {
  note_id: string
  parent_hash: string | null
  user_id: string
  device_id: string
  hlc: string
  created: string
  emoji: string
  message: string
  deleted: boolean
}

/**
 * 리비전 내용으로부터 식별자를 만든다. git의 커밋 객체 포맷을 따라
 * `commit <길이>\0<본문>` 형태를 해싱하고, 여러 줄일 수 있는 `message`는
 * 빈 줄 뒤 맨 마지막에 둬서 구분이 모호해지지 않게 한다.
 *
 * `parent_hash`가 본문에 들어가므로 조상 중 하나라도 다르면 해시가 달라진다.
 * 즉 이력 전체가 해시에 봉인된다.
 *
 * `crypto.subtle`은 브라우저와 Node 양쪽에 있으므로 클라이언트가 계산한 해시를
 * 서버가 같은 코드로 다시 계산해 검증할 수 있다.
 */
export async function commitHash(input: CommitHashInput) {
  const body =
    `note ${input.note_id}\n` +
    `parent ${input.parent_hash ?? ''}\n` +
    `author ${input.user_id}\n` +
    `device ${input.device_id}\n` +
    `hlc ${input.hlc}\n` +
    `created ${input.created}\n` +
    `deleted ${input.deleted ? 1 : 0}\n` +
    `emoji ${input.emoji}\n` +
    `\n${input.message}\n`

  const content = encoder.encode(body)
  const header = encoder.encode(`commit ${content.byteLength}\0`)
  const payload = new Uint8Array(header.byteLength + content.byteLength)

  payload.set(header)
  payload.set(content, header.byteLength)

  const digest = await crypto.subtle.digest('SHA-256', payload)

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('')
}

export function shortHash(hash: string) {
  return hash.slice(0, 7)
}
