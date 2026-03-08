import type { Metadata, Viewport } from 'next'
import { Nunito, DM_Serif_Display, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { PwaRegister } from '@/components/pwa-register'
import './globals.css'

const _nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const _dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"], variable: "--font-dm-serif" });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Piggy Bank - Personal Finance',
  description: 'A cute, premium personal finance app to manage your spending and savings.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Piggy Bank',
  },
}

export const viewport: Viewport = {
  themeColor: '#13151C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_nunito.variable} ${_dmSerif.variable} font-sans antialiased`}>
        {children}
        <PwaRegister />
        <Analytics />
      </body>
    </html>
  )
}
