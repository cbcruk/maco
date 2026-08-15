import { CommitSchema } from '@/db/schema'
import { ReactNode } from 'react'

type CommitDetailParams = { id: string }

export type CommitDetailProps = { params: Promise<CommitDetailParams> }

export type NoteId = Pick<CommitSchema, 'note_id'>

/**
 * 렌더 프롭은 동기적으로 JSX 를 돌려준다. React 19 의 `FC` 는 반환형에
 * `Promise<ReactNode>` 를 포함해서 Fragment 안에 넣을 수 없다.
 */
export type CommitDetailParamsProps = {
  params: CommitDetailProps['params']
  children: (params: NoteId) => ReactNode
}

export type CommitDetailQueryProps = {
  params: NoteId
  children: (result: { data: CommitSchema; userId: string }) => ReactNode
}

export type CommitThreadQueryProps = {
  params: NoteId
  children: (result: {
    thread: CommitSchema[]
    rootNoteId: string
    userId: string
  }) => ReactNode
}
