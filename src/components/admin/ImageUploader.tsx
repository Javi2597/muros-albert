'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Star, ArrowUp, ArrowDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { thumbImage } from '@/lib/cloudinary'

export type UploadedPhoto = {
  cloudinaryId: string
  url: string
  altText: string
  caption: string
  order: number
  isPrimary: boolean
}

interface ImageUploaderProps {
  value: UploadedPhoto[]
  onChange: (photos: UploadedPhoto[]) => void
  folder?: string
}

type UploadStatus = 'idle' | 'uploading' | 'error'

interface FileWithStatus {
  file: File
  previewUrl: string
  status: UploadStatus
  progress: number
  error?: string
}

export function ImageUploader({
  value,
  onChange,
  folder = 'albert-inmo/propiedades',
}: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [queue, setQueue] = useState<FileWithStatus[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Upload a Cloudinary ────────────────────────────────────────
  const uploadFile = useCallback(
    async (fws: FileWithStatus) => {
      // 1. Pedir firma al servidor
      const sigRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      })
      const { timestamp, signature, apiKey, cloudName } = await sigRes.json()

      // 2. Subir a Cloudinary
      const formData = new FormData()
      formData.append('file', fws.file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('folder', folder)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      )

      if (!uploadRes.ok) throw new Error('Error al subir la imagen')

      const data = await uploadRes.json()
      return { cloudinaryId: data.public_id as string, url: data.secure_url as string }
    },
    [folder]
  )

  // ── Procesar archivos seleccionados ───────────────────────────
  const processFiles = useCallback(
    async (files: File[]) => {
      const valid = files.filter((f) => f.type.startsWith('image/'))
      if (valid.length === 0) return

      const newEntries: FileWithStatus[] = valid.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'uploading' as UploadStatus,
        progress: 0,
      }))

      setQueue((prev) => [...prev, ...newEntries])

      // Subir en paralelo
      await Promise.all(
        newEntries.map(async (entry) => {
          try {
            const { cloudinaryId, url } = await uploadFile(entry)

            // Añadir a las fotos del formulario
            onChange([
              ...value,
              {
                cloudinaryId,
                url,
                altText: '',
                caption: '',
                order: value.length,
                isPrimary: value.length === 0, // la primera es portada
              },
            ])

            setQueue((prev) =>
              prev.map((q) =>
                q.previewUrl === entry.previewUrl
                  ? { ...q, status: 'idle', progress: 100 }
                  : q
              )
            )
          } catch {
            setQueue((prev) =>
              prev.map((q) =>
                q.previewUrl === entry.previewUrl
                  ? { ...q, status: 'error', error: 'Error al subir' }
                  : q
              )
            )
          }
        })
      )

      // Limpiar previews completados tras 1 s
      setTimeout(() => {
        setQueue((prev) => prev.filter((q) => q.status !== 'idle'))
      }, 1000)
    },
    [uploadFile, value, onChange]
  )

  // ── Drag & drop handlers ──────────────────────────────────────
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      processFiles(Array.from(e.dataTransfer.files))
    },
    [processFiles]
  )

  // ── Manipulación del array de fotos ──────────────────────────
  const removePhoto = (index: number) => {
    const next = value.filter((_, i) => i !== index).map((p, i) => ({
      ...p,
      order: i,
      isPrimary: i === 0,
    }))
    onChange(next)
  }

  const setPrimary = (index: number) => {
    onChange(value.map((p, i) => ({ ...p, isPrimary: i === index })))
  }

  const movePhoto = (index: number, direction: 'up' | 'down') => {
    const next = [...value]
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next.map((p, i) => ({ ...p, order: i, isPrimary: i === 0 })))
  }

  const updateAlt = (index: number, altText: string) => {
    onChange(value.map((p, i) => (i === index ? { ...p, altText } : p)))
  }

  const isUploading = queue.some((q) => q.status === 'uploading')

  return (
    <div className="flex flex-col gap-4">
      {/* ── Zona de drop ── */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Subir fotos"
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-all',
          dragging
            ? 'border-slate-400 bg-slate-50'
            : 'border-gray-200 bg-gray-50 hover:border-slate-300 hover:bg-gray-100'
        )}
      >
        {isUploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        ) : (
          <Upload className="h-8 w-8 text-gray-300" />
        )}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">
            {isUploading ? 'Subiendo imágenes…' : 'Arrastra las fotos aquí'}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            o haz clic para seleccionarlas · JPG, PNG, WEBP · Máx. 10 MB c/u
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => processFiles(Array.from(e.target.files ?? []))}
        />
      </div>

      {/* ── Errores de upload ── */}
      {queue.filter((q) => q.status === 'error').map((q) => (
        <p key={q.previewUrl} className="text-xs text-red-500">
          Error subiendo {q.file.name}
        </p>
      ))}

      {/* ── Grid de fotos subidas ── */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((photo, i) => (
            <div
              key={photo.cloudinaryId}
              className={cn(
                'group relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm',
                photo.isPrimary ? 'border-slate-800 ring-2 ring-slate-800 ring-offset-1' : 'border-gray-100'
              )}
            >
              {/* Imagen */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <Image
                  src={thumbImage(photo.cloudinaryId)}
                  alt={photo.altText || `Foto ${i + 1}`}
                  fill
                  sizes="200px"
                  className="object-cover"
                />

                {/* Overlay de acciones */}
                <div className="absolute inset-0 flex items-start justify-between p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  {/* Portada */}
                  <button
                    type="button"
                    onClick={() => setPrimary(i)}
                    title={photo.isPrimary ? 'Foto portada' : 'Establecer como portada'}
                    className={cn(
                      'rounded-full p-1 text-white shadow transition',
                      photo.isPrimary
                        ? 'bg-amber-400'
                        : 'bg-black/50 hover:bg-amber-400'
                    )}
                  >
                    <Star className="h-3.5 w-3.5" fill={photo.isPrimary ? 'currentColor' : 'none'} />
                  </button>

                  {/* Eliminar */}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    title="Eliminar foto"
                    className="rounded-full bg-red-500/80 p-1 text-white shadow hover:bg-red-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Controles de orden + alt text */}
              <div className="flex flex-col gap-1.5 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-gray-400">
                    {photo.isPrimary ? '⭐ Portada' : `Foto ${i + 1}`}
                  </span>
                  <div className="flex gap-0.5">
                    <button
                      type="button"
                      onClick={() => movePhoto(i, 'up')}
                      disabled={i === 0}
                      className="rounded p-0.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                      title="Mover arriba"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePhoto(i, 'down')}
                      disabled={i === value.length - 1}
                      className="rounded p-0.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                      title="Mover abajo"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={photo.altText}
                  onChange={(e) => updateAlt(i, e.target.value)}
                  placeholder="Descripción de la foto"
                  className="w-full rounded border-0 bg-gray-50 px-2 py-1 text-[11px] text-gray-600 ring-1 ring-gray-200 focus:ring-slate-400 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
