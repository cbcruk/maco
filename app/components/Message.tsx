import { PropsWithChildren } from 'react'

export function Message({ children }: PropsWithChildren) {
  return (
    <p className="inline-block p-2 rounded-lg bg-yellow-400 text-gray-800 font-medium empty:none">
      {children}
    </p>
  )
}
