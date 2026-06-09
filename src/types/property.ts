import type { Property, Photo, Category, Feature } from '@prisma/client'
import { PropertyStatus, PropertyType, OperationType } from '@prisma/client'

// -------------------------------------------------------
// Re-exports de enums para usar en el cliente sin Prisma
// -------------------------------------------------------
export { PropertyStatus, PropertyType, OperationType }

// -------------------------------------------------------
// Property con relaciones (para listados y fichas)
// -------------------------------------------------------
export type PropertyWithRelations = Property & {
  photos: Photo[]
  category: Category | null
  features: Array<{
    feature: Feature
  }>
}

// Versión ligera para tarjetas (solo lo necesario → menos payload)
export type PropertyCard = Pick<
  Property,
  | 'id'
  | 'slug'
  | 'title'
  | 'price'
  | 'priceOld'
  | 'type'
  | 'status'
  | 'operation'
  | 'city'
  | 'district'
  | 'areaTotal'
  | 'areaUsable'
  | 'bedrooms'
  | 'bathrooms'
  | 'floor'
  | 'hasParking'
  | 'hasTerrace'
  | 'whatsappPhone'
  | 'whatsappMessage'
  | 'reference'
> & {
  primaryPhoto: Pick<Photo, 'cloudinaryId' | 'url' | 'altText'> | null
  category: Pick<Category, 'name' | 'color'> | null
}

// -------------------------------------------------------
// Labels y colores para los enums
// -------------------------------------------------------
export const STATUS_CONFIG: Record<
  PropertyStatus,
  { label: string; className: string }
> = {
  ACTIVE:   { label: 'Disponible', className: 'bg-emerald-100 text-emerald-800' },
  RESERVED: { label: 'Reservada',  className: 'bg-amber-100  text-amber-800'  },
  SOLD:     { label: 'Vendida',    className: 'bg-red-100    text-red-800'    },
  RENTED:   { label: 'Alquilada', className: 'bg-blue-100   text-blue-800'   },
  INACTIVE: { label: 'Inactiva',  className: 'bg-gray-100   text-gray-500'   },
}

export const TYPE_CONFIG: Record<
  PropertyType,
  { label: string; className: string }
> = {
  SALE: { label: 'Venta',    className: 'bg-slate-800 text-white' },
  RENT: { label: 'Alquiler', className: 'bg-slate-600 text-white' },
  BOTH: { label: 'Venta / Alquiler', className: 'bg-slate-700 text-white' },
}

export const OPERATION_LABELS: Record<OperationType, string> = {
  HOUSE:      'Casa',
  APARTMENT:  'Piso',
  COMMERCIAL: 'Local',
  OFFICE:     'Oficina',
  LAND:       'Terreno',
  GARAGE:     'Garaje',
  STORAGE:    'Trastero',
}
