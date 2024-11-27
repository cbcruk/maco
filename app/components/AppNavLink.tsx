'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ComponentProps } from 'react'

export function AppNavLink({
  children,
  ...props
}: ComponentProps<typeof Link>) {
  const pathname = usePathname()

  return (
    <Link
      className="hover:font-bold aria-[current=page]:font-bold aria-[current=page]:underline"
      aria-current={props.href === pathname ? 'page' : undefined}
      {...props}
    >
      {children}
    </Link>
  )
}
