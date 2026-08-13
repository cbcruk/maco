/**
 * 하이브리드 논리 시계 (Hybrid Logical Clock)
 *
 * 기기 시계는 서로 다르다. 벽시계만으로 "나중에 쓴 것"을 판정하면 시계가 빠른
 * 기기가 항상 이긴다. HLC는 다른 기기에서 더 큰 시계를 보면 자기 시계를 끌어올려
 * 인과관계를 보존한다.
 *
 * 인코딩은 고정 폭이라 문자열 사전순 정렬이 곧 시계 순서다. 그래서 SQLite에서
 * `MAX(hlc)`만으로 최신 리비전을 고를 수 있다.
 */
export type Hlc = {
  millis: number
  counter: number
  device_id: string
}

const MILLIS_WIDTH = 15
const COUNTER_WIDTH = 4
const MAX_COUNTER = 0xffff

export function encodeHlc({ millis, counter, device_id }: Hlc) {
  return [
    Math.floor(millis).toString().padStart(MILLIS_WIDTH, '0'),
    counter.toString(16).padStart(COUNTER_WIDTH, '0'),
    device_id,
  ].join(':')
}

export function parseHlc(value: string): Hlc | null {
  const [millis, counter, ...rest] = value.split(':')
  const device_id = rest.join(':')

  if (!millis || !counter || !device_id) {
    return null
  }

  const parsed = {
    millis: Number(millis),
    counter: parseInt(counter, 16),
    device_id,
  }

  if (Number.isNaN(parsed.millis) || Number.isNaN(parsed.counter)) {
    return null
  }

  return parsed
}

/**
 * 다음 시계를 만든다. 벽시계가 앞섰으면 그 값으로 리셋하고, 그렇지 않으면
 * (시계가 뒤로 갔거나 같은 밀리초 안이면) 카운터만 올려 단조 증가를 보장한다.
 */
export function nextHlc({
  previous,
  device_id,
  now = Date.now(),
}: {
  previous: string | null
  device_id: string
  now?: number
}) {
  const parsed = previous ? parseHlc(previous) : null
  const millis = Math.floor(now)

  if (!parsed || millis > parsed.millis) {
    return encodeHlc({ millis, counter: 0, device_id })
  }

  return encodeHlc({
    millis: parsed.millis,
    counter: Math.min(parsed.counter + 1, MAX_COUNTER),
    device_id,
  })
}

export function maxHlc(a: string | null, b: string | null) {
  if (!a) return b
  if (!b) return a

  return a >= b ? a : b
}
