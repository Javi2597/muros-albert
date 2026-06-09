'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updatePropertyStatus } from '@/actions/property.actions'
import { PropertyStatus } from '@prisma/client'
import { STATUS_CONFIG } from '@/types/property'

const STATUSES: PropertyStatus[] = [
  PropertyStatus.ACTIVE,
  PropertyStatus.RESERVED,
  PropertyStatus.SOLD,
  PropertyStatus.RENTED,
  PropertyStatus.INACTIVE,
]

interface StatusToggleProps {
  propertyId: string
  currentStatus: PropertyStatus
}

/**
 * Selector de estado con un clic — el propietario cambia disponibilidad
 * sin abrir el formulario completo.
 */
export function StatusToggle({ propertyId, currentStatus }: StatusToggleProps) {
  const [selected, setSelected] = useState<PropertyStatus>(currentStatus)
  const [isPending, startTransition] = useTransition()

  const handleChange = (status: PropertyStatus) => {
    if (status === selected) return
    setSelected(status)
    startTransition(async () => {
      await updatePropertyStatus(propertyId, status)
    })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STATUSES.map((status) => {
        const { label, className } = STATUS_CONFIG[status]
        const isActive = selected === status
        return (
          <button
            key={status}
            type="button"
            onClick={() => handleChange(status)}
            disabled={isPending}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all',
              isActive
                ? className + ' ring-2 ring-offset-1 ring-current'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              isPending && 'cursor-not-allowed opacity-60'
            )}
          >
            {isPending && isActive && (
              <Loader2 className="h-3 w-3 animate-spin" />
            )}
            {label}
          </button>
        )
      })}
    </div>
  )
}
