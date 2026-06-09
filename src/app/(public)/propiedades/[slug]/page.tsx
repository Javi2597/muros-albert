import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ShareButton } from '@/components/property/ShareButton'

import { prisma } from '@/lib/prisma'
import { buildPropertyMetadata, buildPropertyJsonLd } from '@/lib/seo'
import { formatPrice } from '@/lib/format'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

import { PropertyGallery } from '@/components/property/PropertyGallery'
import { PropertyMap } from '@/components/property/PropertyMap'
import {
  PropertyKeyStats,
  PropertyExtras,
  PropertyFeaturesList,
  EnergyBadge,
} from '@/components/property/PropertyFeatures'
import { StatusBadge, TypeBadge } from '@/components/property/StatusBadge'
import { WhatsAppButton } from '@/components/property/WhatsAppButton'
import { PropertyStatus, PropertyType } from '@/types/property'

// ISR: revalida cada 5 minutos
export const revalidate = 300

// ── generateMetadata ──────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const property = await getProperty(slug)
  if (!property) return { title: 'Propiedad no encontrada' }
  return buildPropertyMetadata(property)
}

// ── generateStaticParams (pre-render en build) ────────────────────
export async function generateStaticParams() {
  const properties = await prisma.property.findMany({
    where: { status: { not: 'INACTIVE' } },
    select: { slug: true },
  })
  return properties.map((p) => ({ slug: p.slug }))
}

// ── Query ─────────────────────────────────────────────────────────
async function getProperty(slug: string) {
  return prisma.property.findUnique({
    where: { slug },
    include: {
      photos:    { orderBy: { order: 'asc' } },
      category:  true,
      features:  { include: { feature: true } },
    },
  })
}

// ── Page ──────────────────────────────────────────────────────────
export default async function PropiedadPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const property = await getProperty(slug)

  if (!property || property.status === 'INACTIVE') notFound()

  const {
    title, description, price, priceOld, type, status,
    address, city, district, latitude, longitude,
    photos, features, category,
    whatsappPhone, whatsappMessage, reference,
    communityFees, energyRating,
  } = property

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const propertyUrl = `${siteUrl}/propiedades/${slug}`

  const whatsappUrl = buildWhatsAppUrl({
    phone: whatsappPhone,
    message: whatsappMessage,
    propertyTitle: title,
    propertyRef: reference ?? undefined,
    propertyUrl,
  })

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildPropertyJsonLd(property) }}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Breadcrumb ── */}
        <nav className="mb-4 text-xs text-gray-400" aria-label="Ruta de navegación">
          <ol className="flex items-center gap-1.5">
            <li><a href="/" className="hover:text-gray-600">Inicio</a></li>
            <li aria-hidden>/</li>
            <li><a href="/propiedades" className="hover:text-gray-600">Propiedades</a></li>
            <li aria-hidden>/</li>
            <li className="text-gray-600 line-clamp-1 max-w-[200px]">{title}</li>
          </ol>
        </nav>

        {/* ── Layout principal: galería + sidebar ── */}
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10">

          {/* ── Columna izquierda ── */}
          <div className="flex flex-col gap-8">

            {/* Galería */}
            <PropertyGallery photos={photos} title={title} />

            {/* Cabecera móvil (se oculta en lg, donde va en sidebar) */}
            <div className="lg:hidden">
              <PropertyHeader
                title={title}
                type={type as PropertyType}
                status={status as PropertyStatus}
                price={price}
                priceOld={priceOld}
                communityFees={communityFees}
                district={district}
                city={city}
                reference={reference}
                category={category}
                energyRating={energyRating}
              />
            </div>

            {/* Descripción */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Descripción
              </h2>
              {/* prose-sm aplica estilos de tipografía a HTML generado por el admin */}
              <div
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </section>

            {/* Stats clave */}
            <PropertyKeyStats property={property} />

            {/* Extras booleanos */}
            <PropertyExtras property={property} />

            {/* Features libres */}
            <PropertyFeaturesList features={features} />

            {/* Mapa */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Ubicación
              </h2>
              <PropertyMap
                latitude={latitude}
                longitude={longitude}
                address={address}
                city={city}
              />
            </section>
          </div>

          {/* ── Sidebar derecho (sticky en desktop) ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 flex flex-col gap-5">

              <PropertyHeader
                title={title}
                type={type as PropertyType}
                status={status as PropertyStatus}
                price={price}
                priceOld={priceOld}
                communityFees={communityFees}
                district={district}
                city={city}
                reference={reference}
                category={category}
                energyRating={energyRating}
              />

              {/* CTA principal */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="mb-4 text-sm text-gray-600 leading-relaxed">
                  ¿Te interesa esta propiedad? Contáctanos y te asesoramos sin compromiso.
                </p>
                <WhatsAppButton
                  phone={whatsappPhone}
                  message={whatsappMessage}
                  propertyTitle={title}
                  propertyRef={reference ?? undefined}
                  propertyUrl={propertyUrl}
                  className="w-full"
                />
              </div>

              {/* Compartir */}
              <ShareButton url={propertyUrl} title={title} />
            </div>
          </aside>
        </div>
      </main>

      {/* ── Barra CTA fija en móvil ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/95 p-3 backdrop-blur-sm lg:hidden">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-sm font-bold text-white shadow-lg active:scale-95"
        >
          {/* WhatsApp icon inline */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Consultar por WhatsApp
        </a>
      </div>

      {/* Padding para que el contenido no quede tapado por la barra fija */}
      <div className="h-20 lg:hidden" aria-hidden />
    </>
  )
}

// ── Sub-componente: cabecera de la propiedad ──────────────────────
import type { Category } from '@prisma/client'
import type { Decimal } from '@prisma/client/runtime/library'

function PropertyHeader({
  title, type, status, price, priceOld, communityFees,
  district, city, reference, category, energyRating,
}: {
  title: string
  type: PropertyType
  status: PropertyStatus
  price: Decimal
  priceOld: Decimal | null
  communityFees: Decimal | null
  district: string | null
  city: string
  reference: string | null
  category: Category | null
  energyRating: string | null
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <TypeBadge type={type} />
        <StatusBadge status={status} />
        {category && (
          <span
            className="inline-flex rounded-sm px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: category.color ?? '#334155' }}
          >
            {category.name}
          </span>
        )}
        {energyRating && <EnergyBadge rating={energyRating} />}
      </div>

      {/* Título */}
      <h1 className="text-xl font-bold text-gray-900 leading-snug sm:text-2xl">
        {title}
      </h1>

      {/* Localización */}
      <p className="text-sm text-gray-500">
        {[district, city].filter(Boolean).join(', ')}
        {reference && (
          <span className="ml-2 text-xs text-gray-400">Ref. {reference}</span>
        )}
      </p>

      {/* Precio */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-gray-900">
          {formatPrice(price)}
          {type === PropertyType.RENT && (
            <span className="ml-1 text-base font-normal text-gray-500">/mes</span>
          )}
        </span>
        {priceOld && (
          <span className="text-base text-gray-400 line-through">
            {formatPrice(priceOld)}
          </span>
        )}
      </div>

      {communityFees && (
        <p className="text-xs text-gray-400">
          + {formatPrice(communityFees)}/mes gastos de comunidad
        </p>
      )}
    </div>
  )
}

// ShareButton importado desde su propio 'use client' file
