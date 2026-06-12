// One-off seed: 4 demo properties for Buenos Aires (CABA).
// Images come from Pexels (stock), are uploaded to Cloudinary, and the
// resulting public_id is stored so cards/map/detail all render consistently.
//
//   node scripts/seed-properties.mjs
//
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import crypto from 'node:crypto'

// ---- load .env (Prisma Client does not auto-load it at runtime) ----
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
for (const line of readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (!m) continue
  let v = m[2].trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
  if (!(m[1] in process.env)) process.env[m[1]] = v
}

const PEXELS_API_KEY = process.env.PEXELS_API_KEY
if (!PEXELS_API_KEY) {
  console.error('Falta PEXELS_API_KEY en .env')
  process.exit(1)
}
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUD_KEY = process.env.CLOUDINARY_API_KEY
const CLOUD_SECRET = process.env.CLOUDINARY_API_SECRET
const FOLDER = 'albert-inmo/propiedades'

const { PrismaClient } = await import('@prisma/client')
const prisma = new PrismaClient()

// 4 demo properties across distinct CABA neighbourhoods (visible on the map)
const PROPERTIES = [
  {
    slug: 'palermo-sky-3-amb', reference: 'CABA-1001',
    title: 'Palermo Sky — 3 ambientes con balcón',
    query: 'modern apartment living room interior bright',
    description: 'Luminoso 3 ambientes en el corazón de Palermo Soho, con balcón aterraza al frente, cocina integrada y excelente luz natural. A metros de Plaza Serrano, rodeado de gastronomía, diseño y la mejor vida de barrio.',
    type: 'SALE', operation: 'APARTMENT',
    price: 235000, district: 'Palermo', city: 'CABA',
    address: 'Honduras 4900', lat: -34.5889, lng: -58.4306,
    areaUsable: 78, bedrooms: 3, bathrooms: 2, floor: 6, hasTerrace: true, hasParking: true,
  },
  {
    slug: 'recoleta-classic-4-amb', reference: 'CABA-1002',
    title: 'Recoleta Classic — Piso de estilo francés',
    query: 'luxury apartment interior elegant',
    description: 'Elegante piso de 4 ambientes en edificio histórico de Recoleta, con techos altos, molduras originales y detalles de categoría. Sobre Av. Alvear, a pasos de los museos, embajadas y la mejor zona de la ciudad.',
    type: 'SALE', operation: 'APARTMENT',
    price: 410000, district: 'Recoleta', city: 'CABA',
    address: 'Av. Alvear 1800', lat: -34.5875, lng: -58.3958,
    areaUsable: 120, bedrooms: 3, bathrooms: 2, floor: 4, hasElevator: true,
  },
  {
    slug: 'caballito-garden-2-amb', reference: 'CABA-1003',
    title: 'Caballito Garden — 2 ambientes a estrenar',
    query: 'apartment balcony city view sunny',
    description: 'Dos ambientes a estrenar en Caballito, con balcón con vista abierta y amenities: SUM, gimnasio y laundry. Ideal primera vivienda o inversión, a una cuadra del Parque Rivadavia y del subte línea A.',
    type: 'RENT', operation: 'APARTMENT',
    price: 480000, district: 'Caballito', city: 'CABA',
    address: 'Av. Rivadavia 5200', lat: -34.6190, lng: -58.4413,
    areaUsable: 48, bedrooms: 2, bathrooms: 1, floor: 8, hasParking: true,
  },
  {
    slug: 'belgrano-loft-brick', reference: 'CABA-1004',
    title: 'Belgrano Loft — Industrial reciclado',
    query: 'loft apartment interior exposed brick',
    description: 'Loft de estilo industrial en Belgrano, con ladrillo a la vista, doble altura y grandes ventanales. Espacio flexible y de diseño, a metros de las Barrancas y la zona comercial de Cabildo.',
    type: 'SALE', operation: 'APARTMENT',
    price: 198000, district: 'Belgrano', city: 'CABA',
    address: 'Echeverría 1500', lat: -34.5627, lng: -58.4560,
    areaUsable: 65, bedrooms: 1, bathrooms: 1, floor: 2, hasTerrace: true,
  },
  {
    slug: 'villa-crespo-studio', reference: 'CABA-1005',
    title: 'Villa Crespo Studio — Diseño escandinavo',
    query: 'scandinavian style apartment interior bright minimal',
    description: 'Monoambiente de diseño en Villa Crespo, con estética escandinava, muebles a medida y mucha luz natural. A pasos de Av. Corrientes y los teatros, en uno de los barrios más vibrantes de la ciudad.',
    type: 'SALE', operation: 'APARTMENT',
    price: 124000, district: 'Villa Crespo', city: 'CABA',
    address: 'Av. Corrientes 5400', lat: -34.5990, lng: -58.4380,
    areaUsable: 40, bedrooms: 1, bathrooms: 1, floor: 5, hasElevator: true,
  },
  {
    slug: 'san-telmo-historico-ph', reference: 'CABA-1006',
    title: 'San Telmo Histórico — PH con patio',
    query: 'vintage apartment interior wooden floor classic',
    description: 'PH con patio en el casco histórico de San Telmo, con detalles originales, pisos calcáreos y techos altos. A metros de Plaza Dorrego y la feria de antigüedades de los domingos.',
    type: 'SALE', operation: 'APARTMENT',
    price: 156000, district: 'San Telmo', city: 'CABA',
    address: 'Defensa 900', lat: -34.6210, lng: -58.3720,
    areaUsable: 72, bedrooms: 2, bathrooms: 1, floor: null, hasTerrace: true,
  },
  {
    slug: 'nunez-riverside-3-amb', reference: 'CABA-1007',
    title: 'Núñez Riverside — 3 amb con amenities',
    query: 'modern luxury apartment interior large windows view',
    description: 'Tres ambientes en torre premium de Núñez, con amenities completos, cochera y vista despejada hacia el río. Excelente conectividad por Av. del Libertador, cerca de River y el campus universitario.',
    type: 'SALE', operation: 'APARTMENT',
    price: 320000, district: 'Núñez', city: 'CABA',
    address: 'Av. del Libertador 7800', lat: -34.5460, lng: -58.4610,
    areaUsable: 88, bedrooms: 3, bathrooms: 2, floor: 12, hasParking: true, hasElevator: true,
  },
  {
    slug: 'colegiales-pop-2-amb', reference: 'CABA-1008',
    title: 'Colegiales Pop — 2 amb luminoso',
    query: 'cozy bright apartment interior plants',
    description: 'Dos ambientes luminoso y alegre en Colegiales, con balcón, cocina integrada y mucho verde alrededor. A una cuadra del Mercado de las Pulgas y la zona de cafés de especialidad.',
    type: 'RENT', operation: 'APARTMENT',
    price: 520000, district: 'Colegiales', city: 'CABA',
    address: 'Av. Federico Lacroze 3300', lat: -34.5760, lng: -58.4490,
    areaUsable: 50, bedrooms: 2, bathrooms: 1, floor: 3, hasTerrace: true,
  },
]

async function pexelsImage(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape&size=large`
  const res = await fetch(url, { headers: { Authorization: PEXELS_API_KEY } })
  if (!res.ok) throw new Error(`Pexels ${res.status}`)
  const data = await res.json()
  const photo = data.photos?.[0]
  if (!photo) throw new Error(`Pexels: sin resultados para "${query}"`)
  return { src: photo.src.large2x || photo.src.large, alt: photo.alt || query, credit: photo.photographer }
}

async function uploadToCloudinary(remoteUrl, publicId) {
  const timestamp = Math.round(Date.now() / 1000)
  const toSign = `folder=${FOLDER}&public_id=${publicId}&timestamp=${timestamp}`
  const signature = crypto.createHash('sha256').update(toSign + CLOUD_SECRET).digest('hex')
  const body = new URLSearchParams({
    file: remoteUrl, api_key: CLOUD_KEY, timestamp: String(timestamp),
    signature, folder: FOLDER, public_id: publicId,
  })
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body })
  const json = await res.json()
  if (!res.ok) throw new Error(`Cloudinary ${res.status}: ${JSON.stringify(json.error || json)}`)
  return json.public_id // ej: albert-inmo/propiedades/palermo-sky-3-amb
}

async function main() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || null
  for (const p of PROPERTIES) {
    process.stdout.write(`• ${p.title} … `)
    const existing = await prisma.property.findUnique({ where: { slug: p.slug } })
    if (existing) { console.log('ya existe, salto'); continue }

    const img = await pexelsImage(p.query)
    const publicId = await uploadToCloudinary(img.src, p.slug)

    await prisma.property.create({
      data: {
        slug: p.slug, title: p.title, description: p.description,
        type: p.type, operation: p.operation, status: 'ACTIVE',
        price: p.price, address: p.address, city: p.city, district: p.district,
        province: 'Buenos Aires', country: 'Argentina',
        latitude: p.lat, longitude: p.lng,
        areaUsable: p.areaUsable, areaTotal: p.areaUsable,
        bedrooms: p.bedrooms, bathrooms: p.bathrooms, floor: p.floor ?? null,
        hasElevator: !!p.hasElevator, hasParking: !!p.hasParking, hasTerrace: !!p.hasTerrace,
        reference: p.reference, whatsappPhone: whatsapp,
        photos: {
          create: [{ cloudinaryId: publicId, url: img.src, altText: img.alt, isPrimary: true, order: 0 }],
        },
      },
    })
    console.log(`OK (cloudinary: ${publicId})`)
  }

  const total = await prisma.property.count()
  console.log(`\nListo. Propiedades en la base: ${total}`)
}

main()
  .catch((e) => { console.error('ERROR:', e); process.exitCode = 1 })
  .finally(() => prisma.$disconnect())
