import { pushCommitsAction } from '@/app/commit/actions'
import {
  abandon,
  dequeue,
  getOutboxSnapshot,
  markAttempt,
  OutboxRecord,
  toRecord,
} from './outbox'

export type FlushResult = {
  pushed: number
  abandoned: OutboxRecord[]
  error: string | null
}

const IDLE: FlushResult = { pushed: 0, abandoned: [], error: null }

let inFlight: Promise<FlushResult> | null = null

/**
 * 아웃박스를 서버로 밀어 넣는다. 여러 곳에서 동시에 불러도 한 번만 돈다.
 */
export function flushOutbox() {
  inFlight ??= push().finally(() => {
    inFlight = null
  })

  return inFlight
}

async function push(): Promise<FlushResult> {
  const pending = getOutboxSnapshot()

  if (pending.length === 0) {
    return IDLE
  }

  const hashes = pending.map((item) => item.hash)
  const result = await pushCommitsAction(pending.map(toRecord)).catch(
    () => null
  )

  // 서버에 닿지 못했다. 오프라인은 실패가 아니므로 큐를 그대로 둔다.
  if (!result) {
    return {
      pushed: 0,
      abandoned: [],
      error: '연결할 수 없어 나중에 다시 시도합니다.',
    }
  }

  if (!result.ok) {
    if (result.retryable) {
      await markAttempt(hashes, result.error)

      return { pushed: 0, abandoned: [], error: result.error }
    }

    return {
      pushed: 0,
      abandoned: await abandon(
        new Map(hashes.map((hash) => [hash, result.error]))
      ),
      error: result.error,
    }
  }

  await dequeue(result.accepted)

  return {
    pushed: result.accepted.length,
    abandoned: await abandon(
      new Map(
        result.rejected.map((rejection) => [rejection.hash, rejection.reason])
      )
    ),
    error: null,
  }
}
