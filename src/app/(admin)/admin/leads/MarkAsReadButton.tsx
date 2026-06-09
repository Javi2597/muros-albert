'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check } from 'lucide-react'

export function MarkAsReadButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const markAsRead = async () => {
    setLoading(true)
    await fetch(`/api/leads/${id}/read`, { method: 'PATCH' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={markAsRead}
      disabled={loading}
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
    >
      <Check className="h-3 w-3" />
      {loading ? 'Guardando…' : 'Marcar leído'}
    </button>
  )
}
