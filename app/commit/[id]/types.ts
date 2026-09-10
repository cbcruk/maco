import { CommitSchema } from '@/db/schema'
import { ReactNode } from 'react'

type CommitDetailParams = { id: string }

export type CommitDetailProps = { params: Promise<CommitDetailParams> }

export type NoteId = Pick<CommitSchema, 'note_id'>

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
