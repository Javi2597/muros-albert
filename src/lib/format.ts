export function formatPrice(price: number | string | { toNumber: () => number }): string {
  const num = typeof price === 'object' ? price.toNumber() : Number(price)

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatArea(m2: number): string {
  return new Intl.NumberFormat('es-AR').format(m2) + ' m²'
}
