import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <h2 className="font-medium">찾을 수 없는 페이지입니다.</h2>
      <p className="text-sm text-gray-400">
        주소를 확인하거나{' '}
        <Link href="/" className="underline">
          홈
        </Link>
        으로 돌아가세요.
      </p>
    </div>
  )
}
