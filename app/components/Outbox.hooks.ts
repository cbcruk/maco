'use client'

import { useEffect, useSyncExternalStore } from 'react'
import {
  getOutboxServerSnapshot,
  getOutboxSnapshot,
  pruneConfirmed,
  subscribeOutbox,
} from '@/lib/outbox'

/**
 * 아직 서버에 반영되지 않은 리비전. 서버가 렌더한 목록 위에 겹쳐서
 * 방금 쓴 메모가 곧바로 보이게 하는 데 쓴다.
 */
export function useOutbox() {
  return useSyncExternalStore(
    subscribeOutbox,
    getOutboxSnapshot,
    getOutboxServerSnapshot
  )
}

/**
 * 새 서버 목록이 도착하면 이미 받아들여진 항목을 큐에서 뺀다.
 *
 * `list`는 서버 렌더마다 새 배열이라 `router.refresh()`가 반영된 시점에
 * 정확히 한 번 돈다. 겹쳐 보여주던 것과 서버가 준 것이 교대하는 순간이라
 * 화면에는 아무 변화가 없다.
 */
export function useOutboxPrune(list: unknown[]) {
  useEffect(() => {
    pruneConfirmed()
  }, [list])
}
