import { ko } from 'date-fns/locale/ko'
import { CommitSchema } from '@/db/schema'
import { DateFormatter, getTimezoneDate, TZName } from '@/lib/date'
import { OutboxRecord, toRecord } from '@/lib/outbox'
import { CommitThread, CommitView } from './CommitList.types'

/**
 * 서버가 준 목록에 아직 올라가지 않은 로컬 리비전을 겹친다.
 *
 * 리비전이 불변이고 `hlc`로 순서가 정해지므로, 생성·수정·삭제를 구분해 다룰
 * 필요가 없다. 같은 메모의 리비전 중 논리 시계가 가장 큰 것만 남기고,
 * 그것이 톰스톤이면 목록에서 빠진다 — 세 경우가 한 규칙으로 처리된다.
 */
export function mergeOutbox(list: CommitSchema[], pending: OutboxRecord[]) {
  const byNote = new Map<string, CommitView>()

  list.forEach((revision) => {
    byNote.set(revision.note_id, { ...revision, pending: false })
  })

  pending.forEach((item) => {
    const revision = { ...toRecord(item), pending: true }
    const current = byNote.get(revision.note_id)

    if (!current || revision.hlc > current.hlc) {
      byNote.set(revision.note_id, revision)
    }
  })

  return Array.from(byNote.values()).filter((revision) => !revision.deleted)
}

/**
 * 평평한 리비전 목록을 스레드로 묶는다. 트리이고 `root_note_id`가
 * 비정규화돼 있으므로 한 번 훑으면 끝난다.
 *
 * 뿌리가 목록에 없는 답글은 버린다. 스레드는 뿌리가 쓰인 달에 속하므로
 * (`docs/git-concept.md` §6.1) 다른 달의 뿌리에 달린 답글이 이 달 화면에
 * 홀로 떠 있으면 안 된다.
 */
export function buildThreads(revisions: CommitView[]): CommitThread[] {
  const roots = new Map<string, CommitView>()
  const replies = new Map<string, CommitView[]>()

  revisions.forEach((revision) => {
    if (!revision.reply_to_note_id) {
      roots.set(revision.note_id, revision)

      return
    }

    const bucket = replies.get(revision.root_note_id)

    if (bucket) {
      bucket.push(revision)
    } else {
      replies.set(revision.root_note_id, [revision])
    }
  })

  return Array.from(roots.values())
    .sort((a, b) => b.created.localeCompare(a.created))
    .map((root) => ({
      root,
      replies: (replies.get(root.note_id) ?? []).sort((a, b) =>
        a.created.localeCompare(b.created)
      ),
    }))
}

/**
 * 날짜 그룹은 **뿌리 기준**이다. 답글은 자기 날짜로 새 그룹을 만들지 않고
 * 뿌리 블록 안에 들어간다.
 *
 * 그룹 키를 사용자 타임존으로 만드는 것이 중요하다. `created`를 UTC 문자열
 * 그대로 자르면 자정 근처 메모가 옆 날짜에 묶인다.
 */
export function groupThreadsByDay(threads: CommitThread[], timezone?: TZName) {
  const groups = new Map<string, { label: string; threads: CommitThread[] }>()

  threads.forEach((thread) => {
    const zoned = getTimezoneDate(new Date(thread.root.created), timezone)
    const key = DateFormatter.formatDate({
      date: zoned,
      formatStr: 'yyyy-MM-dd',
    })
    const group = groups.get(key)

    if (group) {
      group.threads.push(thread)

      return
    }

    groups.set(key, {
      label: DateFormatter.formatDate({
        date: zoned,
        formatStr: 'd일 / EEEE',
        options: { locale: ko },
      }),
      threads: [thread],
    })
  })

  return Array.from(groups, ([key, group]) => ({ key, ...group }))
}
