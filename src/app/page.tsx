import { prisma } from '@/lib/prisma'
import { cardImage } from '@/lib/cloudinary'
import { formatPrice } from '@/lib/format'
import { OPERATION_LABELS } from '@/types/property'
import { HorizonLanding, type HorizonProperty } from '@/components/landing/HorizonLanding'

export const revalidate = 60

const ACCENTS = ['cyan', 'violet', 'pink'] as const
// Imágenes decorativas de respaldo cuando una propiedad aún no tiene foto.
const FALLBACK_IMAGES = [
  '/horizon/img/interior-1.jpg',
  '/horizon/img/interior-3.jpg',
  '/horizon/img/interior-4.jpg',
  '/horizon/img/interior-2.jpg',
  '/horizon/img/facade-2.jpg',
  '/horizon/img/rooftop-1.jpg',
]

function plainExcerpt(text: string, max = 220): string {
  const clean = text
    .replace(/<[^>]+>/g, ' ')             // quita HTML
    .replace(/[#*_`>[\]]/g, '')           // quita marcas markdown comunes
    .replace(/\s+/g, ' ')
    .trim()
  return clean.length > max ? clean.slice(0, max).trimEnd() + '…' : clean
}

export default async function HomePage() {
  // Si la DB no responde, la landing igual se muestra (sin propiedades)
  // en lugar de devolver un error 500.
  const raw = await prisma.property
    .findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: {
        id: true, slug: true, title: true, description: true, price: true,
        operation: true, address: true, city: true, district: true,
        areaUsable: true, areaTotal: true, bedrooms: true, bathrooms: true,
        latitude: true, longitude: true,
        category: { select: { name: true } },
        photos: {
          where: { isPrimary: true }, take: 1,
          select: { cloudinaryId: true },
        },
      },
    })
    .catch(() => [])

  const properties: HorizonProperty[] = raw.map((p, i) => {
    const area = p.areaUsable ?? p.areaTotal
    return {
      id: p.id,
      slug: p.slug,
      name: p.title,
      loc: p.district ?? p.city,
      address: [p.address, p.city].filter(Boolean).join(', '),
      price: formatPrice(p.price),
      tag: p.category?.name ?? OPERATION_LABELS[p.operation],
      img: p.photos[0] ? cardImage(p.photos[0].cloudinaryId) : FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
      beds: p.bedrooms,
      baths: p.bathrooms,
      area: area ? `${area} m²` : '',
      lat: p.latitude,
      lng: p.longitude,
      accent: ACCENTS[i % ACCENTS.length],
      desc: plainExcerpt(p.description),
    }
  })

  return <HorizonLanding properties={properties} />
}
