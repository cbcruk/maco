import Link from 'next/link'
import { Message } from './Message'

export function SessionFallback() {
  return (
    <Message>
      로그인한 사용자만 확인할 수 있습니다.&nbsp;
      <Link prefetch href="/account" className="underline">
        로그인
      </Link>
      을 완료하고 다시 시도해주세요.
    </Message>
  )
}
