import Link from 'next/link'
import { PlusCircle, List, MessageSquare, Eye } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard | Admin' }

export default async function DashboardPage() {
  const [total, active, reserved, leads] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: 'ACTIVE' } }),
    prisma.property.count({ where: { status: 'RESERVED' } }),
    prisma.lead.count({ where: { isRead: false } }),
  ])

  const recentProperties = await prisma.property.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, status: true, updatedAt: true },
  })

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total propiedades" value={total} />
        <StatCard label="Disponibles"        value={active}   color="text-emerald-600" />
        <StatCard label="Reservadas"         value={reserved} color="text-amber-600" />
        <StatCard label="Contactos sin leer" value={leads}    color="text-blue-600" />
      </div>

      {/* Acciones rápidas */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <QuickAction
            href="/admin/propiedades/nueva"
            icon={<PlusCircle className="h-5 w-5" />}
            label="Nueva propiedad"
            description="Añade una propiedad al portal"
          />
          <QuickAction
            href="/admin/propiedades"
            icon={<List className="h-5 w-5" />}
            label="Ver todas"
            description="Gestiona el listado completo"
          />
          <QuickAction
            href="/admin/leads"
            icon={<MessageSquare className="h-5 w-5" />}
            label="Contactos"
            description={leads > 0 ? `${leads} sin leer` : 'Bandeja de entrada'}
          />
        </div>
      </div>

      {/* Actividad reciente */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Modificadas recientemente
        </h2>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {recentProperties.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-400">No hay propiedades aún.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentProperties.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.title}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(p.updatedAt).toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <Link
                    href={`/admin/propiedades/${p.id}/editar`}
                    className="text-xs font-medium text-slate-600 hover:underline"
                  >
                    Editar
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Ver portal público */}
      <div className="flex justify-center">
        <a
          href="/propiedades"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition"
        >
          <Eye className="h-4 w-4" />
          Ver el portal público
        </a>
      </div>
    </div>
  )
}

// ── Componentes de UI del dashboard ──────────────────────────────

function StatCard({
  label,
  value,
  color = 'text-gray-900',
}: {
  label: string
  value: number
  color?: string
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-500">{label}</p>
    </div>
  )
}

function QuickAction({
  href,
  icon,
  label,
  description,
}: {
  href: string
  icon: React.ReactNode
  label: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-slate-200 hover:shadow-md"
    >
      <span className="mt-0.5 text-slate-600">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="mt-0.5 text-xs text-gray-400">{description}</p>
      </div>
    </Link>
  )
}
