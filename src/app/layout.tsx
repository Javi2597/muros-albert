import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const SITE_NAME = 'Albert Inmo'
const SITE_DESC = 'Agencia inmobiliaria en Barcelona. Pisos, casas y locales en venta y alquiler.'
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://albertinmo.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Inmobiliaria en Barcelona`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  openGraph: {
    siteName: SITE_NAME,
    locale: 'es_ES',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-white font-sans text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
