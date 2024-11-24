import { Form } from 'react-router'
import { Button } from '~/components/Button'

export default function DeleteAccount() {
  return (
    <Form
      action="/_actions/deleteAccount"
      method="DELETE"
      role="presentation"
      preventScrollReset
      replace
    >
      <Button type="submit">탈퇴</Button>
    </Form>
  )
}
