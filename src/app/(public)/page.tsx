import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PropertyGrid } from '@/components/property/PropertyGrid'
import type { PropertyCard } from '@/types/property'

export const revalidate = 60

export default async function HomePage() {
  const rawProperties = await prisma.property.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    take: 6,
    select: {
      id: true, slug: true, title: true, price: true, priceOld: true,
      type: true, status: true, operation: true, city: true, district: true,
      areaTotal: true, areaUsable: true, bedrooms: true, bathrooms: true,
      floor: true, hasParking: true, hasTerrace: true,
      whatsappPhone: true, whatsappMessage: true, reference: true,
      category: { select: { name: true, color: true } },
      photos: {
        where: { isPrimary: true }, take: 1,
        select: { cloudinaryId: true, url: true, altText: true },
      },
    },
  })

  const properties: PropertyCard[] = rawProperties.map((p) => ({
    ...p,
    primaryPhoto: p.photos[0] ?? null,
  }))

  return (
    <main>
      {/* Hero */}
      <section className="bg-slate-900 px-4 py-20 text-center sm:py-28">
        <h1 className="text-3xl font-bold text-white sm:text-5xl">
          Encuentra tu próximo hogar
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-300">
          Pisos, casas y locales en venta y alquiler en Barcelona y alrededores.
          Asesoramiento personalizado sin compromiso.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/propiedades?type=SALE"
            className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow transition hover:bg-slate-100"
          >
            Ver propiedades en venta
          </Link>
          <Link
            href="/propiedades?type=RENT"
            className="rounded-xl border border-slate-600 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-400"
          >
            Ver alquileres
          </Link>
        </div>
      </section>

      {/* Propiedades destacadas */}
      {properties.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Propiedades destacadas
              </h2>
              <p className="mt-1 text-sm text-gray-500">Las últimas incorporaciones</p>
            </div>
            <Link
              href="/propiedades"
              className="text-sm font-medium text-slate-700 hover:underline"
            >
              Ver todas →
            </Link>
          </div>
          <PropertyGrid properties={properties} />
        </section>
      )}

      {/* CTA contacto */}
      <section className="bg-gray-50 px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900">¿No encuentras lo que buscas?</h2>
        <p className="mt-2 text-sm text-gray-500">
          Cuéntanos qué necesitas y te ayudamos a encontrarlo.
        </p>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#1ebe5d]"
        >
          Háblanos por WhatsApp
        </a>
      </section>
    </main>
  )
}
