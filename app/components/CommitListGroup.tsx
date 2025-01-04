import { PropsWithChildren } from 'react'

type CommitListGroupProps = PropsWithChildren<{
  label: string
}>

export function CommitListGroup({ label, children }: CommitListGroupProps) {
  return (
    <div className="py-2">
      <div className="sticky top-[56px] bg-white dark:bg-gray-950 px-4 pb-2 text-sm text-gray-400">
        {label}
      </div>
      <div data-part="list">{children}</div>
    </div>
  )
}
