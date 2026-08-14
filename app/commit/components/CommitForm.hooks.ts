'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CommitRecord, MESSAGE_MAX_LENGTH } from '@/db/schema'
import { enqueue } from '@/lib/outbox'
import { flushOutbox } from '@/lib/sync'
import { Message, toMessage } from '@/helpers/getMessage'

type CommitFormValue = {
  emoji: string
  message: string
}

type CommitFormParseResult =
  | { ok: true; value: CommitFormValue }
  | { ok: false; errors: Message[] }

/**
 * 서버로 보내기 전에 브라우저에서 먼저 검증한다. 아웃박스에 넣은 뒤에 거절당하면
 * 사용자는 이미 저장됐다고 믿은 메모를 잃는다.
 */
export function parseCommitForm(form: HTMLFormElement): CommitFormParseResult {
  const formData = new FormData(form)
  const emoji = String(formData.get('emoji') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()

  if (!message) {
    return { ok: false, errors: [toMessage('메시지를 입력해 주세요.')] }
  }

  if (message.length > MESSAGE_MAX_LENGTH) {
    return {
      ok: false,
      errors: [toMessage(`메시지는 ${MESSAGE_MAX_LENGTH}자를 넘을 수 없습니다.`)],
    }
  }

  if (!emoji) {
    return { ok: false, errors: [toMessage('이모지를 선택해 주세요.')] }
  }

  return { ok: true, value: { emoji, message } }
}

/**
 * 쓰기는 로컬 아웃박스에 먼저 들어가고 화면은 즉시 넘어간다. 서버로 밀어 넣는
 * 일은 그 뒤에 일어나며, 실패해도 큐에 남아 나중에 다시 시도된다.
 */
export function useCommitWriter() {
  const router = useRouter()
  const [errors, setErrors] = useState<Message[]>([])
  const [isPending, setIsPending] = useState(false)

  const write = useCallback(
    async (build: () => Promise<CommitRecord>, redirectTo = '/') => {
      setIsPending(true)

      try {
        await enqueue(await build())

        router.push(redirectTo)

        const result = await flushOutbox()

        if (result.pushed > 0) {
          router.refresh()
        }
      } finally {
        setIsPending(false)
      }
    },
    [router]
  )

  return { write, errors, setErrors, isPending }
}
