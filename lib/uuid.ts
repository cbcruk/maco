/**
 * UUIDv7 — 앞 48비트가 밀리초 타임스탬프라 생성 순서대로 정렬된다.
 *
 * 서버와 조율 없이 만들 수 있다는 점이 핵심이다. 서버가 ID를 정하면
 * 오프라인 생성이 원천적으로 불가능하고, 임시 ID를 나중에 바꾸면 그 ID를
 * 참조하던 것들이 전부 깨진다.
 */
export function uuidv7(now = Date.now()) {
  const bytes = new Uint8Array(16)

  crypto.getRandomValues(bytes)

  let millis = Math.floor(now)

  for (let i = 5; i >= 0; i--) {
    bytes[i] = millis % 256
    millis = Math.floor(millis / 256)
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x70 // version 7
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 10

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('')

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-')
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export function isUuid(value: string) {
  return UUID_PATTERN.test(value)
}
