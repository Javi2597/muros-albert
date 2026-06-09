import { cn } from '@/lib/utils'
import { PropertyStatus, PropertyType, STATUS_CONFIG, TYPE_CONFIG } from '@/types/property'

// -------------------------------------------------------
// Badge de estado: Disponible / Reservada / Vendida…
// -------------------------------------------------------
interface StatusBadgeProps {
  status: PropertyStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: colorClass } = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        colorClass,
        className
      )}
    >
      {label}
    </span>
  )
}

// -------------------------------------------------------
// Badge de tipo de operación: Venta / Alquiler
// -------------------------------------------------------
interface TypeBadgeProps {
  type: PropertyType
  className?: string
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const { label, className: colorClass } = TYPE_CONFIG[type]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-bold uppercase tracking-wider',
        colorClass,
        className
      )}
    >
      {label}
    </span>
  )
}
