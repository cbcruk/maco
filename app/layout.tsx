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
        <Session>{AppNav}</Session>
        {children}
      </body>
    </html>
  )
}

export default RootLayout
