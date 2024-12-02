import type { ComponentProps } from 'react'
import styles from './Button.module.css'

export function Button({ children, ...props }: ComponentProps<'button'>) {
  return (
    <button type="submit" className={styles.root} {...props}>
      {children}
    </button>
  )
}
