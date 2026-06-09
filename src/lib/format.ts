/**
 * Formatea un precio en euros con separador de miles.
 * Usa Intl.NumberFormat → localización correcta sin librerías externas.
 *
 * formatPrice(250000)     → "250.000 €"
 * formatPrice(1250)       → "1.250 €"
 * formatPrice(1250.5)     → "1.250,50 €"
 */
export function formatPrice(price: number | string | { toNumber: () => number }): string {
  const num = typeof price === 'object' ? price.toNumber() : Number(price)

  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Formatea m² con separador de miles.
 * formatArea(1200) → "1.200 m²"
 */
export function formatArea(m2: number): string {
  return new Intl.NumberFormat('es-ES').format(m2) + ' m²'
}
