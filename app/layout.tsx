import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import { Session } from './components/Session'
import { AppNav } from './components/AppNav'
import './globals.css'

export const metadata: Metadata = {
  title: 'maco',
  description: '',
}

const notoSans = Noto_Sans_KR({
  weight: ['400', '500', '900'],
  preload: false,
})

type RootLayoutProps = Readonly<{
  children: React.ReactNode
}>

async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body className={`${notoSans.className} antialiased text-xs`}>
        <div data-scope="stacks" className="flex flex-col">
          <div data-part="stacks-row">
            <Session>{AppNav}</Session>
          </div>
          <div data-part="stacks-row">{children}</div>
        </div>
      </body>
    </html>
  )
}

export default RootLayout
