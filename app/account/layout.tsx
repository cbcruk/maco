import { PropsWithChildren } from 'react'

export default function Layout({ children }: PropsWithChildren) {
  return <div className="p-4">{children}</div>
}
