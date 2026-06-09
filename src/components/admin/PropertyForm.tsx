'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save, Eye, ChevronDown, ChevronUp, Loader2,
  Info, Home, DollarSign, Maximize2, Camera, MapPin, Search
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ImageUploader, type UploadedPhoto } from './ImageUploader'
import { createProperty, updateProperty, type PropertyFormData } from '@/actions/property.actions'
import type { Category, Feature, Property, Photo } from '@prisma/client'

// ── Tipos ────────────────────────────────────────────────────────

type PropertyWithAll = Property & { photos: Photo[]; features: Array<{ featureId: string }> }

interface PropertyFormProps {
  /** Si existe → modo edición; si no → modo creación */
  property?: PropertyWithAll
  categories: Category[]
  features: Feature[]
}

// ── Valores por defecto ──────────────────────────────────────────

function defaultValues(property?: PropertyWithAll): PropertyFormData {
  return {
    title:           property?.title           ?? '',
    slug:            property?.slug            ?? '',
    description:     property?.description     ?? '',
    metaTitle:       property?.metaTitle       ?? '',
    metaDesc:        property?.metaDesc        ?? '',
    type:            property?.type            ?? 'SALE',
    status:          property?.status          ?? 'ACTIVE',
    operation:       property?.operation       ?? 'APARTMENT',
    categoryId:      property?.categoryId      ?? '',
    price:           Number(property?.price)   ?? 0,
    priceOld:        property?.priceOld ? Number(property.priceOld) : undefined,
    priceNegotiable: property?.priceNegotiable ?? false,
    communityFees:   property?.communityFees ? Number(property.communityFees) : undefined,
    ibiTax:          property?.ibiTax ? Number(property.ibiTax) : undefined,
    areaTotal:       property?.areaTotal       ?? undefined,
    areaUsable:      property?.areaUsable      ?? undefined,
    areaPlot:        property?.areaPlot        ?? undefined,
    areaTerrace:     property?.areaTerrace     ?? undefined,
    bedrooms:        property?.bedrooms        ?? 0,
    bathrooms:       property?.bathrooms       ?? 0,
    toilets:         property?.toilets         ?? 0,
    floor:           property?.floor           ?? undefined,
    totalFloors:     property?.totalFloors     ?? undefined,
    hasElevator:     property?.hasElevator     ?? false,
    hasParking:      property?.hasParking      ?? false,
    hasPool:         property?.hasPool         ?? false,
    hasGarden:       property?.hasGarden       ?? false,
    hasStorage:      property?.hasStorage      ?? false,
    hasTerrace:      property?.hasTerrace      ?? false,
    hasAC:           property?.hasAC           ?? false,
    hasHeating:      property?.hasHeating      ?? false,
    isPetFriendly:   property?.isPetFriendly   ?? false,
    energyRating:    property?.energyRating    ?? '',
    emissionsRating: property?.emissionsRating ?? '',
    address:         property?.address         ?? '',
    city:            property?.city            ?? '',
    district:        property?.district        ?? '',
    postalCode:      property?.postalCode      ?? '',
    province:        property?.province        ?? 'Buenos Aires',
    country:         property?.country         ?? 'Argentina',
    latitude:        property?.latitude        ?? undefined,
    longitude:       property?.longitude       ?? undefined,
    whatsappPhone:   property?.whatsappPhone   ?? '',
    whatsappMessage: property?.whatsappMessage ?? '',
    reference:       property?.reference       ?? '',
    photos: property?.photos.map((p) => ({
      cloudinaryId: p.cloudinaryId,
      url:          p.url,
      altText:      p.altText  ?? '',
      caption:      p.caption  ?? '',
      order:        p.order,
      isPrimary:    p.isPrimary,
    })) ?? [],
    featureIds: property?.features.map((f) => f.featureId) ?? [],
  }
}

// ── Componente principal ──────────────────────────────────────────

export function PropertyForm({ property, categories, features }: PropertyFormProps) {
  const isEdit = !!property
  const [data, setData] = useState<PropertyFormData>(defaultValues(property))
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<string[]>([])
  const [openSection, setOpenSection] = useState<string>('basic')

  const set = <K extends keyof PropertyFormData>(key: K, val: PropertyFormData[K]) =>
    setData((prev) => ({ ...prev, [key]: val }))

  // ── Validación mínima ─────────────────────────────────────────
  const validate = () => {
    const errs: string[] = []
    if (!data.title.trim())    errs.push('El título es obligatorio')
    if (!data.price || data.price <= 0) errs.push('El precio debe ser mayor que 0')
    if (!data.address.trim())  errs.push('La dirección es obligatoria')
    if (!data.city.trim())     errs.push('La ciudad es obligatoria')
    if (data.photos.length === 0) errs.push('Añade al menos una foto')
    return errs
  }

  const handleSubmit = (status: 'ACTIVE' | 'INACTIVE') => {
    const payload = { ...data, status }
    const errs = validate()
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    startTransition(async () => {
      if (isEdit) {
        await updateProperty(property.id, payload)
      } else {
        await createProperty(payload)
      }
    })
  }

  return (
    <div className="mx-auto max-w-3xl pb-24">

      {/* ── Cabecera ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Editar propiedad' : 'Nueva propiedad'}
          </h1>
          {property?.reference && (
            <p className="text-sm text-gray-400">Ref. {property.reference}</p>
          )}
        </div>
        {/* Vista previa */}
        {isEdit && (
          <a
            href={`/propiedades/${property.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            Ver publicación
          </a>
        )}
      </div>

      {/* ── Errores de validación ── */}
      {errors.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="mb-1 text-sm font-semibold text-red-700">Revisa los siguientes campos:</p>
          <ul className="list-inside list-disc text-sm text-red-600">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-4">

        {/* ═══ SECCIÓN: Información básica ═══ */}
        <Section
          id="basic"
          title="Información básica"
          icon={<Home className="h-4 w-4" />}
          open={openSection}
          onToggle={setOpenSection}
        >
          <Field label="Título del anuncio *" hint="Aparece como título principal en la ficha">
            <input
              type="text"
              value={data.title}
              onChange={(e) => {
                set('title', e.target.value)
                if (!isEdit) set('slug', slugify(e.target.value))
              }}
              placeholder="Piso luminoso con terraza en el Eixample"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo de operación *">
              <Select value={data.type} onChange={(v) => set('type', v as any)}>
                <option value="SALE">Venta</option>
                <option value="RENT">Alquiler</option>
                <option value="BOTH">Venta y alquiler</option>
              </Select>
            </Field>
            <Field label="Tipo de inmueble *">
              <Select value={data.operation} onChange={(v) => set('operation', v as any)}>
                <option value="APARTMENT">Piso / Apartamento</option>
                <option value="HOUSE">Casa / Chalet</option>
                <option value="COMMERCIAL">Local comercial</option>
                <option value="OFFICE">Oficina</option>
                <option value="LAND">Terreno</option>
                <option value="GARAGE">Garaje</option>
                <option value="STORAGE">Trastero</option>
              </Select>
            </Field>
          </div>

          <Field label="Estado de disponibilidad *">
            <Select value={data.status} onChange={(v) => set('status', v as any)}>
              <option value="ACTIVE">✅ Disponible</option>
              <option value="RESERVED">🟡 Reservada</option>
              <option value="SOLD">🔴 Vendida</option>
              <option value="RENTED">🔵 Alquilada</option>
              <option value="INACTIVE">⚪ Borrador (no visible)</option>
            </Select>
          </Field>

          {categories.length > 0 && (
            <Field label="Categoría" hint="Etiqueta editorial: Obra nueva, Lujo, Oportunidad…">
              <Select value={data.categoryId ?? ''} onChange={(v) => set('categoryId', v)}>
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
          )}

          <Field label="Descripción *" hint="Redacta la descripción completa de la propiedad">
            <textarea
              value={data.description}
              onChange={(e) => set('description', e.target.value)}
              rows={8}
              placeholder="Descripción detallada de la propiedad, distribución, características del edificio, entorno del barrio…"
              className={cn(inputClass, 'resize-y')}
            />
          </Field>

          <Field label="Referencia interna" hint="Código de tu agencia, ej: BCN-0042">
            <input
              type="text"
              value={data.reference}
              onChange={(e) => set('reference', e.target.value)}
              placeholder="BCN-0042"
              className={inputClass}
            />
          </Field>
        </Section>

        {/* ═══ SECCIÓN: Precio ═══ */}
        <Section
          id="price"
          title="Precio"
          icon={<DollarSign className="h-4 w-4" />}
          open={openSection}
          onToggle={setOpenSection}
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio (€) *" hint={data.type === 'RENT' ? 'Importe mensual' : 'Precio de venta'}>
              <input
                type="number"
                min={0}
                value={data.price || ''}
                onChange={(e) => set('price', Number(e.target.value))}
                placeholder="250000"
                className={inputClass}
              />
            </Field>
            <Field label="Precio anterior (€)" hint="Se mostrará tachado para indicar rebaja">
              <input
                type="number"
                min={0}
                value={data.priceOld ?? ''}
                onChange={(e) => set('priceOld', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="280000"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Comunidad (€/mes)">
              <input
                type="number"
                min={0}
                value={data.communityFees ?? ''}
                onChange={(e) => set('communityFees', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="80"
                className={inputClass}
              />
            </Field>
            <Field label="IBI (€/año)">
              <input
                type="number"
                min={0}
                value={data.ibiTax ?? ''}
                onChange={(e) => set('ibiTax', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="600"
                className={inputClass}
              />
            </Field>
          </div>

          <Checkbox
            label="Precio negociable"
            checked={data.priceNegotiable}
            onChange={(v) => set('priceNegotiable', v)}
          />
        </Section>

        {/* ═══ SECCIÓN: Características ═══ */}
        <Section
          id="features"
          title="Características"
          icon={<Maximize2 className="h-4 w-4" />}
          open={openSection}
          onToggle={setOpenSection}
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field label="m² útiles">
              <NumberInput value={data.areaUsable} onChange={(v) => set('areaUsable', v)} placeholder="80" />
            </Field>
            <Field label="m² construidos">
              <NumberInput value={data.areaTotal} onChange={(v) => set('areaTotal', v)} placeholder="95" />
            </Field>
            <Field label="m² parcela">
              <NumberInput value={data.areaPlot} onChange={(v) => set('areaPlot', v)} placeholder="200" />
            </Field>
            <Field label="m² terraza">
              <NumberInput value={data.areaTerrace} onChange={(v) => set('areaTerrace', v)} placeholder="15" />
            </Field>
            <Field label="Habitaciones">
              <NumberInput value={data.bedrooms} onChange={(v) => set('bedrooms', v ?? 0)} placeholder="3" />
            </Field>
            <Field label="Baños">
              <NumberInput value={data.bathrooms} onChange={(v) => set('bathrooms', v ?? 0)} placeholder="2" />
            </Field>
            <Field label="Aseos">
              <NumberInput value={data.toilets} onChange={(v) => set('toilets', v ?? 0)} placeholder="1" />
            </Field>
            <Field label="Planta">
              <NumberInput value={data.floor} onChange={(v) => set('floor', v)} placeholder="3" />
            </Field>
            <Field label="Total plantas edificio">
              <NumberInput value={data.totalFloors} onChange={(v) => set('totalFloors', v)} placeholder="8" />
            </Field>
          </div>

          {/* Extras */}
          <div className="mt-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Extras incluidos</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {EXTRAS_CONFIG.map(({ key, label }) => (
                <Checkbox
                  key={key}
                  label={label}
                  checked={data[key] as boolean}
                  onChange={(v) => set(key, v)}
                />
              ))}
            </div>
          </div>

          {/* Eficiencia energética */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Calificación energética">
              <Select value={data.energyRating ?? ''} onChange={(v) => set('energyRating', v)}>
                <option value="">Sin calificación</option>
                {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </Field>
            <Field label="Calificación emisiones">
              <Select value={data.emissionsRating ?? ''} onChange={(v) => set('emissionsRating', v)}>
                <option value="">Sin calificación</option>
                {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </Field>
          </div>

          {/* Features libres */}
          {features.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Características adicionales</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {features.map((f) => (
                  <Checkbox
                    key={f.id}
                    label={f.name}
                    checked={data.featureIds.includes(f.id)}
                    onChange={(checked) =>
                      set(
                        'featureIds',
                        checked
                          ? [...data.featureIds, f.id]
                          : data.featureIds.filter((id) => id !== f.id)
                      )
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* ═══ SECCIÓN: Fotos ═══ */}
        <Section
          id="photos"
          title={`Fotos ${data.photos.length > 0 ? `(${data.photos.length})` : ''}`}
          icon={<Camera className="h-4 w-4" />}
          open={openSection}
          onToggle={setOpenSection}
        >
          <p className="mb-3 text-xs text-gray-500">
            La primera foto (⭐) se usa como portada en el listado. Puedes reordenarlas con las flechas.
          </p>
          <ImageUploader
            value={data.photos}
            onChange={(photos) => set('photos', photos)}
          />
        </Section>

        {/* ═══ SECCIÓN: Ubicación ═══ */}
        <Section
          id="location"
          title="Ubicación"
          icon={<MapPin className="h-4 w-4" />}
          open={openSection}
          onToggle={setOpenSection}
        >
          <Field label="Dirección *" hint="Puedes poner solo la calle o el barrio por privacidad">
            <input
              type="text"
              value={data.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Carrer de Provença, 123"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Ciudad *">
              <input
                type="text"
                value={data.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder="Buenos Aires"
                className={inputClass}
              />
            </Field>
            <Field label="Barrio / Distrito">
              <input
                type="text"
                value={data.district ?? ''}
                onChange={(e) => set('district', e.target.value)}
                placeholder="Eixample"
                className={inputClass}
              />
            </Field>
            <Field label="Código postal">
              <input
                type="text"
                value={data.postalCode ?? ''}
                onChange={(e) => set('postalCode', e.target.value)}
                placeholder="08036"
                className={inputClass}
              />
            </Field>
            <Field label="Provincia">
              <input
                type="text"
                value={data.province}
                onChange={(e) => set('province', e.target.value)}
                placeholder="Buenos Aires"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitud" hint="Para el mapa (opcional)">
              <input
                type="number"
                step="0.000001"
                value={data.latitude ?? ''}
                onChange={(e) => set('latitude', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="41.3874"
                className={inputClass}
              />
            </Field>
            <Field label="Longitud">
              <input
                type="number"
                step="0.000001"
                value={data.longitude ?? ''}
                onChange={(e) => set('longitude', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="2.1686"
                className={inputClass}
              />
            </Field>
          </div>

          <p className="text-xs text-gray-400">
            💡 Puedes obtener las coordenadas buscando la dirección en{' '}
            <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="underline">
              Google Maps
            </a>{' '}
            → clic derecho → &quot;¿Qué hay aquí?&quot;
          </p>
        </Section>

        {/* ═══ SECCIÓN: Contacto WhatsApp ═══ */}
        <Section
          id="contact"
          title="Contacto WhatsApp"
          icon={<Info className="h-4 w-4" />}
          open={openSection}
          onToggle={setOpenSection}
        >
          <Field label="Teléfono WhatsApp" hint="Sin espacios ni +. Ej: 34612345678">
            <input
              type="text"
              value={data.whatsappPhone ?? ''}
              onChange={(e) => set('whatsappPhone', e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="34612345678"
              className={inputClass}
            />
          </Field>
          <Field label="Mensaje personalizado" hint="Si lo dejas vacío se genera automáticamente con el título y la referencia">
            <textarea
              value={data.whatsappMessage ?? ''}
              onChange={(e) => set('whatsappMessage', e.target.value)}
              rows={3}
              placeholder="Hola, me interesa la propiedad…"
              className={cn(inputClass, 'resize-none')}
            />
          </Field>
        </Section>

        {/* ═══ SECCIÓN: SEO (avanzado) ═══ */}
        <Section
          id="seo"
          title="SEO (avanzado)"
          icon={<Search className="h-4 w-4" />}
          open={openSection}
          onToggle={setOpenSection}
        >
          <p className="mb-3 text-xs text-gray-500">
            Opcional. Si lo dejas en blanco se usan el título y la descripción automáticamente.
          </p>
          <Field label="URL amigable (slug)">
            <input
              type="text"
              value={data.slug}
              onChange={(e) => set('slug', slugify(e.target.value))}
              placeholder="piso-3-habitaciones-eixample"
              className={cn(inputClass, 'font-mono text-xs')}
            />
          </Field>
          <Field label="Título SEO" hint="Máx. 60 caracteres">
            <input
              type="text"
              value={data.metaTitle ?? ''}
              onChange={(e) => set('metaTitle', e.target.value)}
              maxLength={60}
              placeholder={data.title || 'Título para Google'}
              className={inputClass}
            />
          </Field>
          <Field label="Meta descripción" hint="Máx. 160 caracteres. Aparece en los resultados de Google">
            <textarea
              value={data.metaDesc ?? ''}
              onChange={(e) => set('metaDesc', e.target.value)}
              maxLength={160}
              rows={2}
              placeholder="Descripción breve que aparecerá en Google…"
              className={cn(inputClass, 'resize-none')}
            />
          </Field>
        </Section>
      </div>

      {/* ── Barra de acciones fija ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleSubmit('INACTIVE')}
            disabled={isPending}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Guardar borrador
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('ACTIVE')}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 transition active:scale-95"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Publicar propiedad'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Helpers de UI reutilizables ───────────────────────────────────

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition'

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    >
      {children}
    </select>
  )
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-slate-800 focus:ring-slate-500"
      />
      {label}
    </label>
  )
}

function NumberInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | undefined
  onChange: (v: number | undefined) => void
  placeholder?: string
}) {
  return (
    <input
      type="number"
      min={0}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
      placeholder={placeholder}
      className={inputClass}
    />
  )
}

// ── Acordeón de secciones ─────────────────────────────────────────

function Section({
  id,
  title,
  icon,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  icon: React.ReactNode
  open: string
  onToggle: (id: string) => void
  children: React.ReactNode
}) {
  const isOpen = open === id
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => onToggle(isOpen ? '' : id)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          {icon}
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="flex flex-col gap-4 border-t border-gray-100 px-5 pb-5 pt-4">
          {children}
        </div>
      )}
    </div>
  )
}

// ── Config de extras ──────────────────────────────────────────────

const EXTRAS_CONFIG: Array<{ key: keyof PropertyFormData; label: string }> = [
  { key: 'hasParking',    label: '🚗 Parking'          },
  { key: 'hasPool',       label: '🏊 Piscina'           },
  { key: 'hasGarden',     label: '🌿 Jardín'            },
  { key: 'hasStorage',    label: '📦 Trastero'          },
  { key: 'hasTerrace',    label: '🌅 Terraza'           },
  { key: 'hasAC',         label: '❄️ Aire acondicionado'},
  { key: 'hasHeating',    label: '🔥 Calefacción'       },
  { key: 'hasElevator',   label: '🛗 Ascensor'          },
  { key: 'isPetFriendly', label: '🐾 Admite mascotas'   },
]

// ── Slugify helper (cliente) ──────────────────────────────────────

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
