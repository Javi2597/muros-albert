/**
 * Generador de deep links de WhatsApp.
 * Usa wa.me → funciona en móvil (abre la app) y escritorio (abre web).
 */

const DEFAULT_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? ''

type WhatsAppLinkOptions = {
  phone?: string | null
  message?: string | null
  // Datos de la propiedad para construir el mensaje por defecto
  propertyTitle?: string
  propertyRef?: string
  propertyUrl?: string
}

/**
 * Devuelve la URL de WhatsApp con el número y mensaje codificados.
 *
 * Ejemplo de output:
 * https://wa.me/34612345678?text=Hola%2C+me+interesa+el+piso...
 */
export function buildWhatsAppUrl({
  phone,
  message,
  propertyTitle,
  propertyRef,
  propertyUrl,
}: WhatsAppLinkOptions): string {
  const cleanPhone = (phone ?? DEFAULT_PHONE).replace(/[^0-9]/g, '')

  const defaultMessage = [
    `Hola, me interesa la propiedad:`,
    propertyTitle && `*${propertyTitle}*`,
    propertyRef && `Ref: ${propertyRef}`,
    propertyUrl && propertyUrl,
    `¿Podría darme más información?`,
  ]
    .filter(Boolean)
    .join('\n')

  const text = encodeURIComponent(message ?? defaultMessage)

  return `https://wa.me/${cleanPhone}?text=${text}`
}
