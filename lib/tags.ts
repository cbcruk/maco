/**
 * `#tag` 형태의 인라인 태그를 message 본문에서 추출한다.
 * - 유니코드 문자/숫자, `_`, `-`, `/` 를 태그 문자로 허용 (한글 태그 지원)
 * - 마크다운 제목(`# `)은 `#` 뒤에 공백이 오므로 매칭되지 않는다
 */
export const TAG_REGEX = /(?:^|\s)#([\p{L}\p{N}_/-]+)/gu

export function parseTags(message: string): string[] {
  const tags = new Set<string>()

  for (const match of message.matchAll(TAG_REGEX)) {
    tags.add(match[1])
  }

  return [...tags]
}

export type TagCount = {
  tag: string
  count: number
}

export function countTags(messages: string[]): TagCount[] {
  const counts = new Map<string, number>()

  for (const message of messages) {
    for (const tag of parseTags(message)) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}
