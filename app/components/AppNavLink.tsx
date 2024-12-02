'use client'

import Link from 'next/link'
import { ComponentProps } from 'react'
import styles from './AppNavLink.module.css'
import { usePathname } from 'next/navigation'
import { match } from 'path-to-regexp'

type AppNavLinkProps = ComponentProps<typeof Link> & {
  pattern?: string
}

export function AppNavLink({ children, pattern, ...props }: AppNavLinkProps) {
  const pathname = usePathname()

  return (
    <Link
      className={styles.root}
      aria-current={
        match(`${pattern || props.href}`)(`${pathname}/`) ? 'page' : undefined
      }
      {...props}
    >
      {children}
    </Link>
  )
}
