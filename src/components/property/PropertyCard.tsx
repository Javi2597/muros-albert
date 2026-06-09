import Image from 'next/image'
import Link from 'next/link'
import { BedDouble, Bath, Maximize2, Car, Building2 } from 'lucide-react'

import { cardImage } from '@/lib/cloudinary'
import { formatPrice } from '@/lib/format'
import type { PropertyCard as PropertyCardType } from '@/types/property'
import { PropertyStatus, PropertyType, OPERATION_LABELS } from '@/types/property'
import { StatusBadge, TypeBadge } from './StatusBadge'
import { WhatsAppButton } from './WhatsAppButton'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: PropertyCardType
  className?: string
  priority?: boolean // para LCP de las primeras cards
}

export function PropertyCard({ property, className, priority = false }: PropertyCardProps) {
  const {
    id,
    slug,
    title,
    price,
    priceOld,
    type,
    status,
    operation,
    city,
    district,
    areaTotal,
    areaUsable,
    bedrooms,
    bathrooms,
    floor,
    hasParking,
    primaryPhoto,
    category,
    whatsappPhone,
    whatsappMessage,
    reference,
  } = property

  const isUnavailable = status === PropertyStatus.SOLD || status === PropertyStatus.RENTED || status === PropertyStatus.INACTIVE
  const imageUrl = primaryPhoto ? cardImage(primaryPhoto.cloudinaryId) : '/placeholder-property.jpg'
  const altText = primaryPhoto?.altText ?? title
  const area = areaUsable ?? areaTotal

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const propertyUrl = `${siteUrl}/propiedades/${slug}`

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm',
        'border border-gray-100 transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-0.5',
        isUnavailable && 'opacity-75',
        className
      )}
    >
      {/* ── Imagen ── */}
      <Link href={`/propiedades/${slug}`} className="block overflow-hidden">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={altText}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              'object-cover transition-transform duration-500',
              'group-hover:scale-105',
              isUnavailable && 'grayscale-[30%]'
            )}
            priority={priority}
          />

          {/* Badges sobre la imagen */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <TypeBadge type={type as PropertyType} />
            {category && (
              <span
                className="inline-flex rounded-sm px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: category.color ?? '#334155' }}
              >
                {category.name}
              </span>
            )}
          </div>

          {/* Estado (solo si no es disponible) */}
          {status !== PropertyStatus.ACTIVE && (
            <div className="absolute right-3 top-3">
              <StatusBadge status={status as PropertyStatus} />
            </div>
          )}

          {/* Botón WhatsApp flotante — visible en hover en desktop */}
          <div
            className={cn(
              'absolute bottom-3 right-3 transition-all duration-200',
              'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0',
              'sm:block hidden' // solo desktop; en móvil está abajo
            )}
          >
            <WhatsAppButton
              variant="icon"
              phone={whatsappPhone}
              message={whatsappMessage}
              propertyTitle={title}
              propertyRef={reference ?? undefined}
              propertyId={id}
              propertyUrl={propertyUrl}
            />
          </div>
        </div>
      </Link>

      {/* ── Contenido ── */}
      <div className="flex flex-1 flex-col gap-3 p-4">

        {/* Precio */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-gray-900 sm:text-2xl">
            {formatPrice(price)}
            {type === PropertyType.RENT && (
              <span className="ml-1 text-sm font-normal text-gray-500">/mes</span>
            )}
          </span>
          {priceOld && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(priceOld)}
            </span>
          )}
        </div>

        {/* Título */}
        <Link href={`/propiedades/${slug}`}>
          <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800 hover:text-gray-600 transition-colors sm:text-base">
            {title}
          </h2>
        </Link>

        {/* Localización */}
        <p className="flex items-center gap-1 text-xs text-gray-500">
          <Building2 className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />
          {[OPERATION_LABELS[operation], district, city].filter(Boolean).join(' · ')}
          {floor != null && ` · Planta ${floor === 0 ? 'baja' : floor}ª`}
        </p>

        {/* Stats: m², habitaciones, baños */}
        <div className="flex items-center gap-4 border-t border-gray-100 pt-3 text-xs text-gray-600">
          {area && (
            <Stat icon={<Maximize2 className="h-3.5 w-3.5" />} value={`${area} m²`} />
          )}
          {bedrooms > 0 && (
            <Stat icon={<BedDouble className="h-3.5 w-3.5" />} value={bedrooms} />
          )}
          {bathrooms > 0 && (
            <Stat icon={<Bath className="h-3.5 w-3.5" />} value={bathrooms} />
          )}
          {hasParking && (
            <Stat icon={<Car className="h-3.5 w-3.5" />} value="Parking" />
          )}
        </div>

        {/* WhatsApp — visible en móvil siempre */}
        <div className="sm:hidden">
          <WhatsAppButton
            phone={whatsappPhone}
            message={whatsappMessage}
            propertyTitle={title}
            propertyRef={reference ?? undefined}
            propertyId={id}
            propertyUrl={propertyUrl}
            className="w-full"
          />
        </div>
      </div>
    </article>
  )
}

// ── Stat pequeño con icono ──────────────────────────────
function Stat({ icon, value }: { icon: React.ReactNode; value: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1 font-medium">
      {icon}
      {value}
    </span>
  )
}
