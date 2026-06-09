import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PropertyForm } from '@/components/admin/PropertyForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Editar propiedad | Admin' }

export default async function EditarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string; updated?: string }>
}) {
  const { id } = await params
  const sp = await searchParams

  const [property, categories, features] = await Promise.all([
    prisma.property.findUnique({
      where: { id },
      include: {
        photos:   { orderBy: { order: 'asc' } },
        features: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.feature.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!property) notFound()

  return (
    <div>
      {/* Toast de confirmación */}
      {sp.created === '1' && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          ✅ Propiedad creada correctamente
        </div>
      )}
      {sp.updated === '1' && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          ✅ Cambios guardados correctamente
        </div>
      )}
      <PropertyForm property={property} categories={categories} features={features} />
    </div>
  )
}
