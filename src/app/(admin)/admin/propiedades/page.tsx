import Link from 'next/link'
import { PlusCircle, Pencil } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { StatusToggle } from '@/components/admin/StatusToggle'
import { formatPrice } from '@/lib/format'
import { OPERATION_LABELS } from '@/types/property'
import type { Metadata } from 'next'
import type { PropertyStatus, OperationType } from '@prisma/client'

export const metadata: Metadata = { title: 'Propiedades | Admin' }

export default async function PropiedadesAdminPage() {
  const properties = await prisma.property.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, slug: true, title: true, price: true,
      type: true, status: true, operation: true, city: true,
      reference: true, updatedAt: true,
      photos: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true },
      },
    },
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          Propiedades ({properties.length})
        </h1>
        <Link
          href="/admin/propiedades/nueva"
          className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition"
        >
          <PlusCircle className="h-4 w-4" />
          Nueva propiedad
        </Link>
      </div>

      {/* Tabla */}
      {properties.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-500">Aún no tienes propiedades publicadas.</p>
          <Link
            href="/admin/propiedades/nueva"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700 underline"
          >
            Crear la primera propiedad
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3">Propiedad</th>
                <th className="hidden px-4 py-3 sm:table-cell">Precio</th>
                <th className="hidden px-4 py-3 lg:table-cell">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {properties.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  {/* Título + meta */}
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 line-clamp-1">{p.title}</span>
                      <span className="mt-0.5 text-xs text-gray-400">
                        {OPERATION_LABELS[p.operation as OperationType]} · {p.city}
                        {p.reference && ` · Ref. ${p.reference}`}
                      </span>
                    </div>
                  </td>
                  {/* Precio */}
                  <td className="hidden px-4 py-4 sm:table-cell">
                    <span className="font-semibold text-gray-800">{formatPrice(p.price)}</span>
                    {p.type === 'RENT' && (
                      <span className="ml-1 text-xs text-gray-400">/mes</span>
                    )}
                  </td>
                  {/* Status toggle inline */}
                  <td className="hidden px-4 py-4 lg:table-cell">
                    <StatusToggle
                      propertyId={p.id}
                      currentStatus={p.status as PropertyStatus}
                    />
                  </td>
                  {/* Acciones */}
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/admin/propiedades/${p.id}/editar`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition"
                    >
                      <Pencil className="h-3 w-3" />
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
