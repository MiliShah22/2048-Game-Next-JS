import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import ClientLayout from './ClientLayout'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: '2048 - Puzzle Game',
  description: 'Play the classic 2048 puzzle game. Combine tiles to reach 2048 and beyond!',
  generator: 'Mili Shah',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="_geist class">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

