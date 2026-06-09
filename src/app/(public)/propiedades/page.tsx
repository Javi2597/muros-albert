import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { PropertyGrid } from '@/components/property/PropertyGrid'
import type { PropertyCard } from '@/types/property'
import { PropertyStatus } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Propiedades en venta y alquiler | Albert Inmo',
  description:
    'Encuentra pisos, casas y locales en Barcelona. Asesoramiento personalizado y las mejores propiedades seleccionadas para ti.',
}

// Revalidar cada 60 s → ISR: SEO + frescura de datos sin SSR puro
export const revalidate = 60

export default async function PropiedadesPage() {
  // Server Component → query directa a la BD sin API route
  const rawProperties = await prisma.property.findMany({
    where: {
      status: { not: PropertyStatus.INACTIVE },
    },
    orderBy: [
      { status: 'asc' }, // ACTIVE primero (A < R < S)
      { createdAt: 'desc' },
    ],
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      priceOld: true,
      type: true,
      status: true,
      operation: true,
      city: true,
      district: true,
      areaTotal: true,
      areaUsable: true,
      bedrooms: true,
      bathrooms: true,
      floor: true,
      hasParking: true,
      hasTerrace: true,
      whatsappPhone: true,
      whatsappMessage: true,
      reference: true,
      category: {
        select: { name: true, color: true },
      },
      photos: {
        where: { isPrimary: true },
        take: 1,
        select: { cloudinaryId: true, url: true, altText: true },
      },
    },
  })

  // Mapear foto primaria al campo esperado por PropertyCard
  const properties: PropertyCard[] = rawProperties.map((p) => ({
    ...p,
    primaryPhoto: p.photos[0] ?? null,
  }))

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Cabecera */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Propiedades
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {properties.length}{' '}
          {properties.length === 1 ? 'propiedad disponible' : 'propiedades disponibles'}
        </p>
      </div>

      {/* TODO: <PropertyFilters /> — siguiente iteración */}

      <PropertyGrid properties={properties} />
    </main>
  )
}
