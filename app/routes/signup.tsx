import { ActionFunctionArgs, redirect, Form, MetaFunction } from 'react-router'
import { Button } from '~/components/Button'
import { Input } from '~/components/Input'
import { createUser } from '~/lib/user.server'

export const meta: MetaFunction = () => {
  return [
    { title: '가입 | maco' },
    {
      name: 'description',
      content: '',
    },
  ]
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const formFieldset = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const response = await createUser(formFieldset)

  if (!response.ok) {
    throw response
  }

  return redirect('/signin')
}

export default function Signup() {
  return (
    <Form method="post">
      <fieldset className="flex flex-col gap-4 w-min">
        <div className="flex flex-col gap-2">
          <Input
            name="name"
            type="text"
            placeholder="이름을 입력해 주세요"
            defaultValue=""
          />
          <Input
            name="email"
            type="email"
            placeholder="이메일을 입력해 주세요"
            defaultValue=""
          />
          <Input
            name="password"
            type="password"
            placeholder="비밀번호를 입력해 주세요"
            defaultValue=""
          />
        </div>
        <div className="flex">
          <Button type="submit">가입</Button>
        </div>
      </fieldset>
    </Form>
  )
}
