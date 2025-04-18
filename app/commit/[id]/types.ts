import { CommitSchema, UserSelectSchema } from '@/db/schema'
import { FC } from 'react'

type CommitDetailParams = { id: string }

export type CommitDetailProps = { params: Promise<CommitDetailParams> }

export type CommitId = Pick<CommitSchema, 'id'>

export type CommitDetailParamsProps = {
  params: CommitDetailProps['params']
  children: FC<CommitId>
}

export type CommitDetailQueryProps = {
  params: CommitId & {
    user_id: UserSelectSchema['id']
  }
  children: FC<{ data: CommitSchema }>
}
