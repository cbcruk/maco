'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ComponentProps } from 'react'
import styles from './AppNavLink.module.css'

export function AppNavLink({
  children,
  ...props
}: ComponentProps<typeof Link>) {
  const pathname = usePathname()

  return (
    <Link
      className={styles.root}
      aria-current={props.href === pathname ? 'page' : undefined}
      {...props}
    >
      {children}
    </Link>
  )
}
