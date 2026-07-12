import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { merge } from '@/lib/classNames'

type MarkdownProps = {
  children: string
  className?: string
}

const proseClassName = merge(
  'break-keep',
  '[&_a]:underline [&_a]:decoration-wavy',
  '[&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em] dark:[&_code]:bg-gray-800',
  '[&_pre]:my-1 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-gray-100 [&_pre]:p-2 dark:[&_pre]:bg-gray-800',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-2 [&_blockquote]:text-gray-500 dark:[&_blockquote]:border-gray-700',
  '[&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_h3]:font-bold',
  '[&_input]:mr-1 [&_p]:my-0.5 [&_li]:my-0.5'
)

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={merge(proseClassName, className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
