import { prisma } from '@/lib/prisma'
import { PropertyForm } from '@/components/admin/PropertyForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nueva propiedad | Admin' }

export default async function NuevaPage() {
  const [categories, features] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.feature.findMany({ orderBy: { name: 'asc' } }),
  ])

  return <PropertyForm categories={categories} features={features} />
}
