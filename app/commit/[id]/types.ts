import { CommitSchema } from '@/db/schema'
import { FC } from 'react'

type CommitDetailParams = { id: string }

export type CommitDetailProps = { params: Promise<CommitDetailParams> }

export type NoteId = Pick<CommitSchema, 'note_id'>

export type CommitDetailParamsProps = {
  params: CommitDetailProps['params']
  children: FC<NoteId>
}

export type CommitDetailQueryProps = {
  params: NoteId
  children: FC<{ data: CommitSchema; userId: string }>
}
