import { PropsWithChildren } from 'react'

export function WarnMessage({ children }: PropsWithChildren) {
  return (
    <p className="inline-flex p-2 rounded-lg bg-yellow-400 text-gray-800 font-medium empty:none">
      {children}
    </p>
  )
}
