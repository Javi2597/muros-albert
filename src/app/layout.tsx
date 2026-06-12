import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Fuente display usada por la landing "Living Interface"
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-space',
})

const SITE_NAME = 'Albert Inmo'
const SITE_DESC = 'Agencia inmobiliaria en Buenos Aires. Propiedades en venta y alquiler en CABA y GBA.'
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://albertinmo.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Inmobiliaria en Buenos Aires`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  openGraph: {
    siteName: SITE_NAME,
    locale: 'es_AR',
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
    <html lang="es" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-white font-sans text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
