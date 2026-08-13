'use client'

import { useSyncExternalStore } from 'react'
import {
  getOutboxServerSnapshot,
  getOutboxSnapshot,
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
