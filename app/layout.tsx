import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import { Session } from './components/Session'
import { AppNav } from './components/AppNav'
import './globals.css'
import { ProgressBar, ProgressBarProvider } from 'react-transition-progress'

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
        <ProgressBarProvider>
          <ProgressBar className="fixed z-50 h-[2px] shadow-lg shadow-sky-500/20 bg-blue-600 top-0" />
          <div data-scope="stacks" className="flex flex-col">
            <div
              data-part="stacks-row"
              className="sticky top-0 z-40 bg-zinc-950"
            >
              <Session>{AppNav}</Session>
            </div>
            <div data-part="stacks-row">{children}</div>
          </div>
        </ProgressBarProvider>
      </body>
    </html>
  )
}

export default RootLayout
