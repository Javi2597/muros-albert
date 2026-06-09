import {
  BedDouble, Bath, Maximize2, Car, Waves, Trees, Warehouse,
  Wind, Thermometer, PawPrint, Layers, Zap, Leaf, Check,
} from 'lucide-react'
import type { Property, Feature } from '@prisma/client'
import { cn } from '@/lib/utils'
import { formatArea } from '@/lib/format'
import { OPERATION_LABELS } from '@/types/property'
import type { OperationType } from '@prisma/client'

// ── Mapa icono → Feature.icon (nombre string en BD) ─────────────
const ICON_MAP: Record<string, React.ElementType> = {
  bed: BedDouble, bath: Bath, area: Maximize2, car: Car,
  pool: Waves, tree: Trees, storage: Warehouse, wind: Wind,
  heat: Thermometer, paw: PawPrint, floor: Layers, zap: Zap,
  leaf: Leaf,
}

function FeatureIcon({ name }: { name: string | null }) {
  const Icon = (name && ICON_MAP[name]) ? ICON_MAP[name] : Check
  return <Icon className="h-4 w-4 flex-shrink-0 text-slate-600" aria-hidden />
}

// ── Datos clave de la propiedad (superficie, habitaciones…) ──────
interface KeyStatsProps {
  property: Pick<
    Property,
    | 'areaTotal' | 'areaUsable' | 'areaPlot' | 'areaTerrace'
    | 'bedrooms' | 'bathrooms' | 'toilets' | 'floor' | 'totalFloors'
    | 'operation' | 'hasElevator' | 'energyRating'
  >
}

export function PropertyKeyStats({ property }: KeyStatsProps) {
  const {
    areaTotal, areaUsable, areaPlot, areaTerrace,
    bedrooms, bathrooms, toilets, floor, totalFloors,
    operation, hasElevator, energyRating,
  } = property

  const stats = [
    areaUsable  && { label: 'Sup. útil',        value: formatArea(areaUsable) },
    areaTotal   && { label: 'Sup. construida',   value: formatArea(areaTotal) },
    areaPlot    && { label: 'Parcela',            value: formatArea(areaPlot) },
    areaTerrace && { label: 'Terraza',            value: formatArea(areaTerrace) },
    bedrooms > 0 && { label: 'Habitaciones',     value: bedrooms },
    bathrooms > 0 && { label: 'Baños',           value: bathrooms },
    toilets > 0  && { label: 'Aseos',            value: toilets },
    floor != null && {
      label: 'Planta',
      value: floor === 0 ? 'Baja' : `${floor}ª${totalFloors ? ` de ${totalFloors}` : ''}`,
    },
    { label: 'Tipo',    value: OPERATION_LABELS[operation as OperationType] },
    hasElevator && { label: 'Ascensor',  value: 'Sí' },
    energyRating && { label: 'Eficiencia energética', value: energyRating },
  ].filter(Boolean) as { label: string; value: string | number }[]

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
        Características
      </h2>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {stats.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-gray-800">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// ── Extras booleanos (piscina, garaje, AC…) ──────────────────────
interface PropertyExtrasProps {
  property: Pick<
    Property,
    | 'hasParking' | 'hasPool' | 'hasGarden' | 'hasStorage'
    | 'hasTerrace' | 'hasAC' | 'hasHeating' | 'isPetFriendly'
  >
}

const EXTRAS: Array<{ key: keyof PropertyExtrasProps['property']; label: string; icon: string }> = [
  { key: 'hasParking',   label: 'Parking',      icon: 'car'     },
  { key: 'hasPool',      label: 'Piscina',       icon: 'pool'    },
  { key: 'hasGarden',    label: 'Jardín',        icon: 'tree'    },
  { key: 'hasStorage',   label: 'Trastero',      icon: 'storage' },
  { key: 'hasTerrace',   label: 'Terraza',       icon: 'area'    },
  { key: 'hasAC',        label: 'Aire acond.',   icon: 'wind'    },
  { key: 'hasHeating',   label: 'Calefacción',   icon: 'heat'    },
  { key: 'isPetFriendly',label: 'Admite mascotas', icon: 'paw'   },
]

export function PropertyExtras({ property }: PropertyExtrasProps) {
  const active = EXTRAS.filter(({ key }) => property[key])
  if (active.length === 0) return null

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
        Extras
      </h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {active.map(({ label, icon }) => (
          <li key={label} className="flex items-center gap-2 text-sm text-gray-700">
            <FeatureIcon name={icon} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Features libres de la BD (tabla Feature) ─────────────────────
interface PropertyFeaturesListProps {
  features: Array<{ feature: Pick<Feature, 'name' | 'icon'> }>
}

export function PropertyFeaturesList({ features }: PropertyFeaturesListProps) {
  if (features.length === 0) return null

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
        Detalles adicionales
      </h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {features.map(({ feature }) => (
          <li key={feature.name} className="flex items-center gap-2 text-sm text-gray-700">
            <FeatureIcon name={feature.icon} />
            {feature.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Badge de eficiencia energética ───────────────────────────────
const ENERGY_COLORS: Record<string, string> = {
  A: 'bg-green-600', B: 'bg-green-500', C: 'bg-lime-500',
  D: 'bg-yellow-400 text-gray-800', E: 'bg-orange-400', F: 'bg-orange-600', G: 'bg-red-600',
}

export function EnergyBadge({ rating }: { rating: string }) {
  const color = ENERGY_COLORS[rating.toUpperCase()] ?? 'bg-gray-400'
  return (
    <span className={cn('inline-flex items-center rounded px-2 py-0.5 text-xs font-bold text-white', color)}>
      {rating}
    </span>
  )
}
