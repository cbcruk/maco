import {
  isRouteErrorResponse,
  Links,
  LoaderFunctionArgs,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from 'react-router'
import type { Route } from './+types/root'
import './tailwind.css'
import { getSession } from './lib/session.server'
import { AppNav } from './components/AppNav'

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100..900&display=swap',
  },
  {
    rel: 'icon',
    href: '/favicon.svg',
    type: 'image/svg+xml',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col overflow-x-hidden min-h-screen max-w-[100vw] text-xs">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'))

  return {
    isLogin: session.has('_id'),
  }
}

export default function App() {
  const navigation = useNavigation()

  return (
    <div data-navigation-state={navigation.state}>
      <AppNav />
      <div className="px-4">
        <Outlet />
      </div>
    </div>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <pre className="p-4">
      {JSON.stringify(
        isRouteErrorResponse(error)
          ? {
              status: error.status,
              statusText: error.statusText,
              data: error.data,
            }
          : error instanceof Error
          ? { message: error.message, stack: error.stack }
          : 'Unknown Error',
        null,
        2
      )}
    </pre>
  )
}
