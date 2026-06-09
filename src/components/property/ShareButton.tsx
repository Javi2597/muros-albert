'use client'

import { Share2 } from 'lucide-react'

interface ShareButtonProps {
  url: string
  title: string
}

/**
 * Usa la Web Share API si el navegador la soporta (móvil).
 * En escritorio hace fallback a clipboard copy.
 */
export function ShareButton({ url, title }: ShareButtonProps) {
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // El usuario canceló el share — no hacer nada
      }
    } else {
      await navigator.clipboard.writeText(url)
      alert('Enlace copiado al portapapeles')
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
    >
      <Share2 className="h-4 w-4" aria-hidden />
      Compartir propiedad
    </button>
  )
}
