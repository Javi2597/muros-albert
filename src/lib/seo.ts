import type { Metadata } from 'next'
import { ogImage } from './cloudinary'
import { formatPrice } from './format'
import type { PropertyWithRelations } from '@/types/property'
import { OPERATION_LABELS } from '@/types/property'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://albertinmo.com'
const SITE_NAME = 'Albert Inmo'

/**
 * Genera el objeto Metadata de Next.js para una ficha de propiedad.
 * Incluye Open Graph y Twitter Card para compartir en redes.
 */
export function buildPropertyMetadata(property: PropertyWithRelations): Metadata {
  const { title, metaTitle, metaDesc, description, slug, photos, price, type, operation, city, district } = property

  const seoTitle = metaTitle ?? `${title} | ${SITE_NAME}`

  const locationStr = [district, city].filter(Boolean).join(', ')
  const fallbackDesc = `${OPERATION_LABELS[operation]} en ${type === 'RENT' ? 'alquiler' : 'venta'} en ${locationStr}. ${formatPrice(price)}${type === 'RENT' ? '/mes' : ''}. ${description.slice(0, 100)}…`
  const seoDesc = metaDesc ?? fallbackDesc

  const primaryPhoto = photos.find((p) => p.isPrimary) ?? photos[0]
  const ogImageUrl = primaryPhoto
    ? ogImage(primaryPhoto.cloudinaryId)
    : `${SITE_URL}/og-default.jpg`

  return {
    title: seoTitle,
    description: seoDesc,
    alternates: {
      canonical: `${SITE_URL}/propiedades/${slug}`,
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: `${SITE_URL}/propiedades/${slug}`,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'es_ES',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
      images: [ogImageUrl],
    },
  }
}

/**
 * JSON-LD structured data (RealEstateListing) para Google Rich Results.
 * Insértalo en la página con <script type="application/ld+json">.
 */
export function buildPropertyJsonLd(property: PropertyWithRelations): string {
  const { title, description, price, city, address, photos, slug } = property
  const primaryPhoto = photos.find((p) => p.isPrimary) ?? photos[0]

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: title,
    description: description.slice(0, 200),
    url: `${SITE_URL}/propiedades/${slug}`,
    image: primaryPhoto ? ogImage(primaryPhoto.cloudinaryId) : undefined,
    offers: {
      '@type': 'Offer',
      price: Number(price),
      priceCurrency: 'EUR',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: city,
      addressCountry: 'ES',
    },
  })
}
