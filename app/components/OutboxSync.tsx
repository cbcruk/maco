'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { loadOutbox, OutboxRecord } from '@/lib/outbox'
import { flushOutbox } from '@/lib/sync'

/**
 * 아웃박스를 서버로 흘려보내는 백그라운드 작업.
 *
 * 쓰기 직후에는 폼이 직접 flush하고, 여기서는 놓친 것들을 챙긴다 —
 * 앱을 다시 열었을 때, 온라인으로 돌아왔을 때, 다른 탭에서 돌아왔을 때.
 */
export function OutboxSync() {
  const { status } = useSession()
  const router = useRouter()
  const [abandoned, setAbandoned] = useState<OutboxRecord[]>([])

  const flush = useCallback(async () => {
    const result = await flushOutbox()

    if (result.pushed > 0) {
      router.refresh()
    }

    if (result.abandoned.length > 0) {
      setAbandoned((previous) => [...previous, ...result.abandoned])
    }
  }, [router])

  useEffect(() => {
    if (status !== 'authenticated') {
      return
    }

    const handleOnline = () => {
      flush()
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        flush()
      }
    }

    loadOutbox().then(flush)

    window.addEventListener('online', handleOnline)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('online', handleOnline)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [status, flush])

  if (abandoned.length === 0) {
    return null
  }

  return (
    <div className="p-4 flex flex-col gap-2 bg-red-500 text-white text-xs">
      <p className="font-medium">
        올리지 못한 메모가 있습니다. 내용을 옮겨 두신 뒤 다시 작성해 주세요.
      </p>
      <ul className="flex flex-col gap-1">
        {abandoned.map((record) => (
          <li key={record.hash} className="flex flex-col">
            <span>
              {record.emoji} {record.message}
            </span>
            <span className="opacity-80">{record.error}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="self-start underline"
        onClick={() => setAbandoned([])}
      >
        닫기
      </button>
    </div>
  )
}
