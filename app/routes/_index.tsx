import type { MetaFunction } from 'react-router'

export const meta: MetaFunction = () => {
  return [
    { title: '홈 | maco' },
    {
      name: 'description',
      content: '',
    },
  ]
}

export default function Index() {
  return (
    <div className="flex">
      <h1>maco</h1>
    </div>
  )
}
