import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import Provider from './providers'
import '@rainbow-me/rainbowkit/styles.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'xamPAG',
  description: 'Exam Proof Able Grade',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className}`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  )
}
