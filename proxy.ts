/**
 * Next.js 16 에서 `middleware` 는 `proxy` 로 이름이 바뀌었다.
 * `proxy` 는 nodejs 런타임에서 돌므로, DB 계층을 함께 끌어오는 이 인증
 * 설정에는 오히려 맞는 자리다.
 */
export { auth as proxy } from '@/lib/auth'
