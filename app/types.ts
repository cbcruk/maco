import { PropsWithChildren } from 'react'
import { GetSessionReturn } from './components/Session'

export type HomeBodyProps = PropsWithChildren<GetSessionReturn>

export type HomeProps = {
  searchParams: Promise<{
    date?: string
  }>
}
