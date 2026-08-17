'use client'

import { CommitSchema } from '@/db/schema'
import { shortHash } from '@/lib/hash'
import { parseHlc } from '@/lib/hlc'
import { CommitDate } from './CommitDate'

type CommitHistoryProps = {
  /** 한 메모의 리비전 전체. 논리 시계 내림차순(최신이 먼저) */
  revisions: CommitSchema[]
}

/**
 * 리비전이 만들어진 시각은 `hlc` 안에 있다. `created`는 메모가 처음 쓰인
 * 시각이라 리비전이 쌓여도 그대로다 — 이력 화면에서는 그걸 쓰면 전부 같은
 * 시각으로 보인다.
 */
function getRevisionTime(revision: CommitSchema) {
  return parseHlc(revision.hlc)?.millis ?? revision.created
}

function CommitHistoryLabel({
  revision,
  isCurrent,
}: {
  revision: CommitSchema
  isCurrent: boolean
}) {
  if (revision.deleted) {
    return <span>삭제함</span>
  }

  if (isCurrent) {
    return <span className="text-yellow-500">현재</span>
  }

  return <span>{revision.parent_hash ? '수정' : '작성'}</span>
}

export function CommitHistory({ revisions }: CommitHistoryProps) {
  return (
    <div className="flex flex-col">
      {revisions.map((revision, index) => (
        <div
          key={revision.hash}
          id={shortHash(revision.hash)}
          className="flex gap-2 items-start p-4 py-2 border-b border-solid border-gray-900"
        >
          <span className="text-2xl">{revision.emoji}</span>
          <div className="flex flex-col gap-0.5">
            <div className="text-sm break-keep">{revision.message}</div>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <CommitHistoryLabel
                revision={revision}
                isCurrent={index === 0}
              />
              <span>·</span>
              <CommitDate
                date={getRevisionTime(revision)}
                formatStr="M월 d일 aaa h시 m분"
              />
              <span>·</span>
              {/* 콘텐츠 주소. 같은 내용을 다시 써도 값이 달라지므로
                  리비전을 가리키는 이름으로 쓸 수 있다 */}
              <span title={revision.hash} className="font-mono">
                {shortHash(revision.hash)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
