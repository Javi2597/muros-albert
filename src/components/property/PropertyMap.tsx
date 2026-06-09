'use client'

import { MapPin } from 'lucide-react'

interface PropertyMapProps {
  latitude: number | null
  longitude: number | null
  address: string
  city: string
}

/**
 * Mapa con OpenStreetMap via iframe — sin API key ni dependencias npm.
 * Cuando hay coordenadas muestra el mapa centrado; si no, muestra la dirección.
 *
 * Para migrar a Mapbox GL o Google Maps en el futuro:
 * solo hay que reemplazar este componente; el resto del código no cambia.
 */
export function PropertyMap({ latitude, longitude, address, city }: PropertyMapProps) {
  if (!latitude || !longitude) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
        <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
        <span>{address}, {city}</span>
      </div>
    )
  }

  // BBox: ±0.003° ≈ ~300m alrededor del marcador
  const delta = 0.003
  const bbox = [
    longitude - delta,
    latitude  - delta,
    longitude + delta,
    latitude  + delta,
  ].join(',')

  const src =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${bbox}` +
    `&layer=mapnik` +
    `&marker=${latitude},${longitude}`

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
      <iframe
        title="Ubicación de la propiedad"
        src={src}
        width="100%"
        height="320"
        loading="lazy"
        referrerPolicy="no-referrer"
        className="block"
        style={{ border: 0 }}
      />
      {/* Link "Ver en mapa completo" */}
      <div className="flex items-center gap-2 border-t border-gray-100 bg-white px-4 py-2.5">
        <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
        <span className="text-xs text-gray-500">{address}, {city}</span>
        <a
          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs font-medium text-slate-700 hover:underline"
        >
          Ver mapa completo ↗
        </a>
      </div>
    </div>
  )
}
