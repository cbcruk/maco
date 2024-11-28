import { ComponentProps } from 'react'

export default function Layout({ children }: ComponentProps<'div'>) {
  return <div className="px-4">{children}</div>
}
