/**
 * Helpers de Cloudinary para generar URLs optimizadas.
 * La transformación ocurre en la URL → sin coste de servidor.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!

type ImageOptions = {
  width?: number
  height?: number
  quality?: number | 'auto'
  format?: 'auto' | 'webp' | 'avif' | 'jpg'
  crop?: 'fill' | 'fit' | 'thumb' | 'scale'
  gravity?: 'auto' | 'face' | 'center'
}

/**
 * Genera una URL de Cloudinary con transformaciones.
 * Usa f_auto,q_auto por defecto → Cloudinary elige el mejor formato/calidad
 * según el navegador del cliente (webp/avif en modernos).
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: ImageOptions = {}
): string {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options

  const transforms: string[] = [
    `f_${format}`,
    `q_${quality}`,
    crop && `c_${crop}`,
    gravity && `g_${gravity}`,
    width && `w_${width}`,
    height && `h_${height}`,
  ]
    .filter(Boolean)
    .join(',')

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`
}

// Presets listos para usar

/** Imagen para tarjeta del listado — 4:3, 600px ancho */
export const cardImage = (publicId: string) =>
  buildCloudinaryUrl(publicId, { width: 600, height: 450, crop: 'fill', gravity: 'auto' })

/** Imagen hero de la ficha — 1200px ancho */
export const heroImage = (publicId: string) =>
  buildCloudinaryUrl(publicId, { width: 1200, height: 800, crop: 'fill', gravity: 'auto' })

/** Thumbnail para galería — 400x300 */
export const thumbImage = (publicId: string) =>
  buildCloudinaryUrl(publicId, { width: 400, height: 300, crop: 'thumb', gravity: 'auto' })

/** Open Graph — exactamente 1200x630 */
export const ogImage = (publicId: string) =>
  buildCloudinaryUrl(publicId, { width: 1200, height: 630, crop: 'fill', gravity: 'auto', format: 'jpg' })
