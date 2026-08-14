import { CommitRecord } from '@/db/schema'

/**
 * 화면이 그리는 메모 하나. 서버가 준 리비전과 아직 아웃박스에 있는 리비전이
 * 같은 모양이라 한 자리에서 다룰 수 있다. `user_id`는 화면에 쓰이지 않는다.
 */
export type CommitView = CommitRecord & {
  /** 아직 서버에 반영되지 않은 리비전인가 */
  pending: boolean
}

/** 뿌리 하나와 거기 매달린 답글들. 답글은 작성 순서(오름차순) */
export type CommitThread = {
  root: CommitView
  replies: CommitView[]
}
