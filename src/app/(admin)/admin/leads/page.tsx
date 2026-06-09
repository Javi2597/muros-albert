import { prisma } from '@/lib/prisma'
import { MarkAsReadButton } from './MarkAsReadButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contactos | Admin' }
export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const unread = leads.filter((l) => !l.isRead).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          Contactos ({leads.length})
          {unread > 0 && (
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              {unread} sin leer
            </span>
          )}
        </h1>
      </div>

      {leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-500">Aún no hay contactos recibidos.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                lead.isRead ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {!lead.isRead && (
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                    <p className="font-semibold text-gray-900">{lead.name}</p>
                    {lead.source && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        {lead.source}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="hover:text-gray-800 hover:underline">
                        {lead.email}
                      </a>
                    )}
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="hover:text-gray-800 hover:underline">
                        {lead.phone}
                      </a>
                    )}
                  </div>

                  {lead.propertyRef && (
                    <p className="text-xs text-gray-400">Propiedad: {lead.propertyRef}</p>
                  )}

                  {lead.message && (
                    <p className="mt-2 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                      {lead.message}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(lead.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>

                {!lead.isRead && <MarkAsReadButton id={lead.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
