import { CommitRecord } from '@/db/schema'

/**
 * 아웃박스 — 아직 서버에 반영되지 않은 리비전을 담아 두는 로컬 큐.
 *
 * 쓰기는 여기에 먼저 기록되고 UI는 즉시 갱신된다. 서버로 밀어 넣는 일은
 * 백그라운드에서 일어나고, 실패하면 온라인 복귀나 다음 포커스 때 다시 시도한다.
 * 레코드가 불변이고 `hash`가 PK이므로 같은 것을 여러 번 보내도 안전하다.
 */
export type OutboxRecord = CommitRecord & {
  attempts: number
  error: string | null
  /**
   * 서버가 받아들였지만 아직 화면에서 빼지 않은 상태.
   *
   * push 성공 즉시 큐에서 빼면 서버 렌더가 갱신되기 전에 항목이 사라져
   * "저장 → 나타남 → 사라짐 → 다시 나타남"으로 깜빡인다. 그래서 받아들여진
   * 뒤에도 화면에는 계속 겹쳐 두고, 새 서버 목록이 도착한 뒤에 뺀다
   * (`pruneConfirmed`). 다시 보내지는 않는다.
   */
  confirmed: boolean
}

/** 큐 관리용 필드를 떼고 서버로 보낼 리비전만 남긴다 */
export function toRecord(item: OutboxRecord): CommitRecord {
  return {
    hash: item.hash,
    note_id: item.note_id,
    parent_hash: item.parent_hash,
    message: item.message,
    emoji: item.emoji,
    deleted: item.deleted,
    reply_to_note_id: item.reply_to_note_id,
    reply_to_hash: item.reply_to_hash,
    root_note_id: item.root_note_id,
    depth: item.depth,
    device_id: item.device_id,
    hlc: item.hlc,
    created: item.created,
  }
}

const DB_NAME = 'maco-outbox'
const DB_VERSION = 1
const STORE_NAME = 'commits'

let connection: Promise<IDBDatabase> | null = null

function openDatabase() {
  if (connection) {
    return connection
  }

  connection = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'hash' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  return connection
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | null
) {
  const database = await openDatabase()

  return new Promise<T | null>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const request = run(transaction.objectStore(STORE_NAME))

    transaction.oncomplete = () => resolve(request ? request.result : null)
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

/**
 * `useSyncExternalStore`가 읽을 메모리 사본. IndexedDB는 비동기라 렌더 중에
 * 직접 읽을 수 없으므로 여기에 미러링한다.
 */
let snapshot: OutboxRecord[] = []

const listeners = new Set<() => void>()

function publish(records: OutboxRecord[]) {
  snapshot = records.sort((a, b) => a.hlc.localeCompare(b.hlc))
  listeners.forEach((listener) => listener())
}

export function subscribeOutbox(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function getOutboxSnapshot() {
  return snapshot
}

const EMPTY: OutboxRecord[] = []

export function getOutboxServerSnapshot() {
  return EMPTY
}

export async function loadOutbox() {
  const records = await withStore('readonly', (store) => store.getAll())

  publish((records ?? []) as OutboxRecord[])

  return snapshot
}

export async function enqueue(record: CommitRecord) {
  const entry: OutboxRecord = {
    ...record,
    attempts: 0,
    error: null,
    confirmed: false,
  }

  await withStore('readwrite', (store) => store.put(entry))

  publish([...snapshot.filter((item) => item.hash !== entry.hash), entry])

  return entry
}

/** 아직 서버로 보내지 않은 것들. 이미 받아들여진 것을 또 보낼 이유가 없다 */
export function getUnconfirmed() {
  return snapshot.filter((item) => !item.confirmed)
}

/** 서버가 받아들였음을 기록한다. 화면에서 빼는 것은 `pruneConfirmed`가 한다 */
export async function confirm(hashes: string[]) {
  if (hashes.length === 0) {
    return
  }

  const accepted = new Set(hashes)
  const updated = snapshot.map((item) =>
    accepted.has(item.hash) ? { ...item, confirmed: true, error: null } : item
  )

  await withStore('readwrite', (store) => {
    updated
      .filter((item) => accepted.has(item.hash))
      .forEach((item) => store.put(item))

    return null
  })

  publish(updated)
}

/**
 * 새 서버 목록이 도착한 뒤 호출한다. 그 렌더는 push 이후에 일어난 것이므로
 * 받아들여진 항목은 이제 서버 쪽에 반영돼 있다 — 겹쳐 둘 이유가 없다.
 *
 * 목록에 그 항목이 들어 있는지로 판단하지 않는 것은 톰스톤 때문이다.
 * 삭제 리비전은 어떤 목록에도 나타나지 않으므로 영영 확인되지 않는다.
 */
export async function pruneConfirmed() {
  const stale = snapshot.filter((item) => item.confirmed)

  if (stale.length === 0) {
    return
  }

  await dequeue(stale.map((item) => item.hash))
}

export async function dequeue(hashes: string[]) {
  if (hashes.length === 0) {
    return
  }

  const removed = new Set(hashes)

  await withStore('readwrite', (store) => {
    hashes.forEach((hash) => store.delete(hash))

    return null
  })

  publish(snapshot.filter((item) => !removed.has(item.hash)))
}

/**
 * 일시적 실패(오프라인, 세션 만료)를 기록한다. 레코드는 큐에 남는다.
 *
 * 재시도 횟수로 큐에서 빼지 않는 것은 의도적이다. 일주일간 오프라인이었다는
 * 이유로 사용자가 쓴 메모를 버릴 수는 없다. 큐에서 빼는 것은 다시 보내도
 * 결과가 확정적으로 같은 거절뿐이다(`abandon`).
 */
export async function markAttempt(hashes: string[], error: string) {
  if (hashes.length === 0) {
    return
  }

  const targets = new Set(hashes)
  const updated = snapshot.map((item) =>
    targets.has(item.hash)
      ? { ...item, attempts: item.attempts + 1, error }
      : item
  )

  await withStore('readwrite', (store) => {
    updated
      .filter((item) => targets.has(item.hash))
      .forEach((item) => store.put(item))

    return null
  })

  publish(updated)
}

/**
 * 다시 보내도 같은 이유로 거절될 레코드를 큐에서 뺀다. 사용자가 쓴 내용이
 * 조용히 사라지지 않도록 뺀 레코드를 돌려준다.
 */
export async function abandon(rejections: Map<string, string>) {
  const abandoned = snapshot
    .filter((item) => rejections.has(item.hash))
    .map((item) => ({ ...item, error: rejections.get(item.hash) ?? null }))

  if (abandoned.length === 0) {
    return []
  }

  await dequeue(abandoned.map((item) => item.hash))

  return abandoned
}

/** 로그아웃 시 호출한다. 공용 기기에 남으면 그대로 정보 유출이다. */
export async function clearOutbox() {
  await withStore('readwrite', (store) => store.clear())

  publish([])
}
