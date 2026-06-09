import { PropertyCard } from './PropertyCard'
import type { PropertyCard as PropertyCardType } from '@/types/property'

interface PropertyGridProps {
  properties: PropertyCardType[]
  emptyMessage?: string
}

export function PropertyGrid({
  properties,
  emptyMessage = 'No se encontraron propiedades con los filtros seleccionados.',
}: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-medium text-gray-500">{emptyMessage}</p>
        <p className="mt-1 text-sm text-gray-400">Prueba a ajustar los filtros de búsqueda.</p>
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
      role="list"
      aria-label="Listado de propiedades"
    >
      {properties.map((property, index) => (
        <div key={property.id} role="listitem">
          <PropertyCard
            property={property}
            // priority en las primeras 3 → LCP optimizado
            priority={index < 3}
          />
        </div>
      ))}
    </div>
  )
}
