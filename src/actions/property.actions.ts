'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PropertyStatus } from '@prisma/client'

// ── Tipos compartidos ────────────────────────────────────────────

export type PhotoInput = {
  cloudinaryId: string
  url: string
  altText?: string
  caption?: string
  order: number
  isPrimary: boolean
}

export type PropertyFormData = {
  // Básicos
  title: string
  slug: string
  description: string
  metaTitle?: string
  metaDesc?: string
  // Clasificación
  type: string
  status: string
  operation: string
  categoryId?: string
  // Precios
  price: number
  priceOld?: number
  priceNegotiable: boolean
  communityFees?: number
  ibiTax?: number
  // Superficie
  areaTotal?: number
  areaUsable?: number
  areaPlot?: number
  areaTerrace?: number
  // Habitaciones
  bedrooms: number
  bathrooms: number
  toilets: number
  floor?: number
  totalFloors?: number
  // Extras booleanos
  hasElevator: boolean
  hasParking: boolean
  hasPool: boolean
  hasGarden: boolean
  hasStorage: boolean
  hasTerrace: boolean
  hasAC: boolean
  hasHeating: boolean
  isPetFriendly: boolean
  // Energía
  energyRating?: string
  emissionsRating?: string
  // Localización
  address: string
  city: string
  district?: string
  postalCode?: string
  province: string
  country: string
  latitude?: number
  longitude?: number
  // Contacto
  whatsappPhone?: string
  whatsappMessage?: string
  reference?: string
  // Fotos
  photos: PhotoInput[]
  // Features (ids)
  featureIds: string[]
}

// ── Helpers ──────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/** Genera un slug único; añade sufijo numérico si ya existe */
async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base)
  let suffix = 0
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`
    const existing = await prisma.property.findUnique({
      where: { slug: candidate },
      select: { id: true },
    })
    if (!existing || existing.id === excludeId) return candidate
    suffix++
  }
}

// ── Crear propiedad ──────────────────────────────────────────────

export async function createProperty(data: PropertyFormData) {
  const slug = await uniqueSlug(data.slug || data.title)

  const property = await prisma.property.create({
    data: {
      slug,
      title:           data.title,
      description:     data.description,
      metaTitle:       data.metaTitle || null,
      metaDesc:        data.metaDesc  || null,
      type:            data.type      as any,
      status:          data.status    as any,
      operation:       data.operation as any,
      categoryId:      data.categoryId || null,
      price:           data.price,
      priceOld:        data.priceOld       ?? null,
      priceNegotiable: data.priceNegotiable,
      communityFees:   data.communityFees  ?? null,
      ibiTax:          data.ibiTax         ?? null,
      areaTotal:       data.areaTotal      ?? null,
      areaUsable:      data.areaUsable     ?? null,
      areaPlot:        data.areaPlot       ?? null,
      areaTerrace:     data.areaTerrace    ?? null,
      bedrooms:        data.bedrooms,
      bathrooms:       data.bathrooms,
      toilets:         data.toilets,
      floor:           data.floor          ?? null,
      totalFloors:     data.totalFloors    ?? null,
      hasElevator:     data.hasElevator,
      hasParking:      data.hasParking,
      hasPool:         data.hasPool,
      hasGarden:       data.hasGarden,
      hasStorage:      data.hasStorage,
      hasTerrace:      data.hasTerrace,
      hasAC:           data.hasAC,
      hasHeating:      data.hasHeating,
      isPetFriendly:   data.isPetFriendly,
      energyRating:    data.energyRating   || null,
      emissionsRating: data.emissionsRating || null,
      address:         data.address,
      city:            data.city,
      district:        data.district       || null,
      postalCode:      data.postalCode     || null,
      province:        data.province,
      country:         data.country,
      latitude:        data.latitude       ?? null,
      longitude:       data.longitude      ?? null,
      whatsappPhone:   data.whatsappPhone  || null,
      whatsappMessage: data.whatsappMessage || null,
      reference:       data.reference      || null,
      photos: {
        create: data.photos.map((p) => ({
          cloudinaryId: p.cloudinaryId,
          url:          p.url,
          altText:      p.altText   || null,
          caption:      p.caption   || null,
          order:        p.order,
          isPrimary:    p.isPrimary,
        })),
      },
      features: {
        create: data.featureIds.map((featureId) => ({ featureId })),
      },
    },
  })

  revalidatePath('/propiedades')
  revalidatePath('/admin/propiedades')
  redirect(`/admin/propiedades/${property.id}/editar?created=1`)
}

// ── Actualizar propiedad ──────────────────────────────────────────

export async function updateProperty(id: string, data: PropertyFormData) {
  const slug = await uniqueSlug(data.slug || data.title, id)

  // Borrar fotos y features anteriores → reinsertar (más simple que diff)
  await prisma.photo.deleteMany({ where: { propertyId: id } })
  await prisma.propertyFeature.deleteMany({ where: { propertyId: id } })

  await prisma.property.update({
    where: { id },
    data: {
      slug,
      title:           data.title,
      description:     data.description,
      metaTitle:       data.metaTitle || null,
      metaDesc:        data.metaDesc  || null,
      type:            data.type      as any,
      status:          data.status    as any,
      operation:       data.operation as any,
      categoryId:      data.categoryId || null,
      price:           data.price,
      priceOld:        data.priceOld       ?? null,
      priceNegotiable: data.priceNegotiable,
      communityFees:   data.communityFees  ?? null,
      ibiTax:          data.ibiTax         ?? null,
      areaTotal:       data.areaTotal      ?? null,
      areaUsable:      data.areaUsable     ?? null,
      areaPlot:        data.areaPlot       ?? null,
      areaTerrace:     data.areaTerrace    ?? null,
      bedrooms:        data.bedrooms,
      bathrooms:       data.bathrooms,
      toilets:         data.toilets,
      floor:           data.floor          ?? null,
      totalFloors:     data.totalFloors    ?? null,
      hasElevator:     data.hasElevator,
      hasParking:      data.hasParking,
      hasPool:         data.hasPool,
      hasGarden:       data.hasGarden,
      hasStorage:      data.hasStorage,
      hasTerrace:      data.hasTerrace,
      hasAC:           data.hasAC,
      hasHeating:      data.hasHeating,
      isPetFriendly:   data.isPetFriendly,
      energyRating:    data.energyRating   || null,
      emissionsRating: data.emissionsRating || null,
      address:         data.address,
      city:            data.city,
      district:        data.district       || null,
      postalCode:      data.postalCode     || null,
      province:        data.province,
      country:         data.country,
      latitude:        data.latitude       ?? null,
      longitude:       data.longitude      ?? null,
      whatsappPhone:   data.whatsappPhone  || null,
      whatsappMessage: data.whatsappMessage || null,
      reference:       data.reference      || null,
      photos: {
        create: data.photos.map((p) => ({
          cloudinaryId: p.cloudinaryId,
          url:          p.url,
          altText:      p.altText   || null,
          caption:      p.caption   || null,
          order:        p.order,
          isPrimary:    p.isPrimary,
        })),
      },
      features: {
        create: data.featureIds.map((featureId) => ({ featureId })),
      },
    },
  })

  revalidatePath('/propiedades')
  revalidatePath(`/propiedades/${slug}`)
  revalidatePath('/admin/propiedades')
  redirect(`/admin/propiedades/${id}/editar?updated=1`)
}

// ── Cambiar estado rápido (disponible / reservada / vendida…) ────

export async function updatePropertyStatus(id: string, status: PropertyStatus) {
  const property = await prisma.property.update({
    where: { id },
    data: { status },
    select: { slug: true },
  })

  revalidatePath('/propiedades')
  revalidatePath(`/propiedades/${property.slug}`)
  revalidatePath('/admin/propiedades')
}

// ── Eliminar propiedad ───────────────────────────────────────────

export async function deleteProperty(id: string) {
  // onDelete: Cascade en el schema elimina fotos y features automáticamente
  await prisma.property.delete({ where: { id } })

  revalidatePath('/propiedades')
  revalidatePath('/admin/propiedades')
  redirect('/admin/propiedades')
}
