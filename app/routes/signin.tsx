import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  Form,
  useNavigation,
  MetaFunction,
} from 'react-router'
import { Button } from '~/components/Button'
import { Input } from '~/components/Input'
import { commitSession, getSession } from '~/lib/session.server'
import { auth } from '~/lib/auth.server'
import { UserSchema } from '~/schema'

export const meta: MetaFunction = () => {
  return [
    { title: '로그인 | maco' },
    {
      name: 'description',
      content: '',
    },
  ]
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const formFieldset = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  const response = await auth(formFieldset)

  if (!response.ok) {
    throw response
  }

  const user = (await response.json()) as UserSchema
  const session = await getSession(request.headers.get('Cookie'))
  session.set('_id', user.id)

  const headers = new Headers()
  headers.set('Set-Cookie', await commitSession(session))

  return redirect('/', {
    headers,
  })
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'))

  if (session.has('_id')) {
    return redirect('/')
  }

  return null
}

export default function Signin() {
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <Form method="post">
      <fieldset disabled={isSubmitting} className="w-min">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Input
              type="email"
              name="email"
              placeholder="이메일을 입력해 주세요"
              defaultValue=""
            />
            <Input
              type="password"
              name="password"
              placeholder="비밀번호를 입력해 주세요"
              defaultValue=""
            />
          </div>
          <div className="flex">
            <Button type="submit" disabled={isSubmitting}>
              로그인
            </Button>
          </div>
        </div>
      </fieldset>
    </Form>
  )
}
