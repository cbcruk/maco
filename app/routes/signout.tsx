import { Form, MetaFunction } from 'react-router'
import { Button } from '~/components/Button'

export const meta: MetaFunction = () => {
  return [
    { title: '로그아웃 | maco' },
    {
      name: 'description',
      content: '',
    },
  ]
}

export default function SignOut() {
  return (
    <Form
      action="/_actions/signout"
      method="POST"
      role="presentation"
      preventScrollReset
      replace
    >
      <Button type="submit">로그아웃</Button>
    </Form>
  )
}
