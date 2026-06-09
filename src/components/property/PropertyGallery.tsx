'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { heroImage, thumbImage } from '@/lib/cloudinary'
import type { Photo } from '@prisma/client'

interface PropertyGalleryProps {
  photos: Pick<Photo, 'cloudinaryId' | 'url' | 'altText' | 'caption' | 'order'>[]
  title: string
}

export function PropertyGallery({ photos, title }: PropertyGalleryProps) {
  const sorted = [...photos].sort((a, b) => a.order - b.order)

  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  // Navegación con teclado
  const prev = useCallback(() => setActive((i) => (i === 0 ? sorted.length - 1 : i - 1)), [sorted.length])
  const next = useCallback(() => setActive((i) => (i === sorted.length - 1 ? 0 : i + 1)), [sorted.length])

  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setLightbox(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, prev, next])

  // Bloquear scroll del body cuando el lightbox está abierto
  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  if (sorted.length === 0) return null

  const current = sorted[active]

  return (
    <>
      {/* ── Galería principal ── */}
      <div className="flex flex-col gap-2">
        {/* Imagen principal */}
        <div
          className="group relative aspect-[16/10] w-full cursor-zoom-in overflow-hidden rounded-2xl bg-gray-100"
          onClick={() => setLightbox(true)}
        >
          <Image
            key={current.cloudinaryId}
            src={heroImage(current.cloudinaryId)}
            alt={current.altText ?? title}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            priority
          />

          {/* Overlay zoom hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <span className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <ZoomIn className="h-3.5 w-3.5" />
              Ver galería
            </span>
          </div>

          {/* Contador */}
          {sorted.length > 1 && (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {active + 1} / {sorted.length}
            </span>
          )}

          {/* Flechas sobre imagen principal (solo si hay más de 1 foto) */}
          {sorted.length > 1 && (
            <>
              <NavArrow direction="left"  onClick={(e) => { e.stopPropagation(); prev() }} />
              <NavArrow direction="right" onClick={(e) => { e.stopPropagation(); next() }} />
            </>
          )}
        </div>

        {/* Thumbnails */}
        {sorted.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sorted.map((photo, i) => (
              <button
                key={photo.cloudinaryId}
                onClick={() => setActive(i)}
                aria-label={`Ver foto ${i + 1}`}
                className={cn(
                  'relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg transition-all',
                  'sm:h-20 sm:w-32',
                  i === active
                    ? 'ring-2 ring-slate-800 ring-offset-1'
                    : 'opacity-60 hover:opacity-100'
                )}
              >
                <Image
                  src={thumbImage(photo.cloudinaryId)}
                  alt={photo.altText ?? `Foto ${i + 1}`}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setLightbox(false)}
        >
          {/* Imagen lightbox */}
          <div
            className="relative h-full w-full max-h-[85vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={heroImage(current.cloudinaryId)}
              alt={current.altText ?? title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Botón cerrar */}
          <button
            onClick={() => setLightbox(false)}
            aria-label="Cerrar galería"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Caption */}
          {current.caption && (
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-sm text-white">
              {current.caption}
            </p>
          )}

          {/* Flechas lightbox */}
          {sorted.length > 1 && (
            <>
              <NavArrow direction="left"  onClick={(e) => { e.stopPropagation(); prev() }} large />
              <NavArrow direction="right" onClick={(e) => { e.stopPropagation(); next() }} large />
            </>
          )}
        </div>
      )}
    </>
  )
}

// ── Componente flecha de navegación ────────────────────────────
function NavArrow({
  direction,
  onClick,
  large = false,
}: {
  direction: 'left' | 'right'
  onClick: (e: React.MouseEvent) => void
  large?: boolean
}) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      onClick={onClick}
      aria-label={direction === 'left' ? 'Foto anterior' : 'Foto siguiente'}
      className={cn(
        'absolute top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white backdrop-blur-sm',
        'transition hover:bg-black/70 active:scale-95',
        direction === 'left' ? 'left-3' : 'right-3',
        large ? 'p-3' : 'p-1.5'
      )}
    >
      <Icon className={cn(large ? 'h-7 w-7' : 'h-5 w-5')} />
    </button>
  )
}
