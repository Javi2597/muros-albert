# Arquitectura del Proyecto — Plataforma Inmobiliaria

## Stack
- **Next.js 14** (App Router) + TypeScript
- **Supabase** (PostgreSQL + Auth + Storage)
- **Prisma** (ORM)
- **Tailwind CSS** + shadcn/ui
- **Cloudinary** (gestión de imágenes)

---

## Estructura de Carpetas

```
albert-inmo/
├── prisma/
│   ├── schema.prisma          # Schema de la BD
│   ├── seed.ts                # Datos de ejemplo para desarrollo
│   └── migrations/            # Historial de migraciones (auto-generado)
│
├── public/
│   ├── og-default.jpg         # Imagen Open Graph por defecto
│   └── favicon.ico
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   │
│   │   ├── (public)/          # Grupo: rutas públicas (sin prefix en URL)
│   │   │   ├── layout.tsx     # Layout con header/footer público
│   │   │   ├── page.tsx       # Home — listado destacado
│   │   │   ├── propiedades/
│   │   │   │   ├── page.tsx   # Listado + filtros
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx  # Ficha de propiedad
│   │   │   ├── contacto/
│   │   │   │   └── page.tsx
│   │   │   └── sitemap.ts     # Sitemap dinámico
│   │   │
│   │   ├── (admin)/           # Grupo: panel privado
│   │   │   ├── layout.tsx     # Layout con sidebar de admin
│   │   │   └── admin/
│   │   │       ├── page.tsx              # Dashboard (stats)
│   │   │       ├── propiedades/
│   │   │       │   ├── page.tsx          # Tabla de propiedades
│   │   │       │   ├── nueva/
│   │   │       │   │   └── page.tsx      # Formulario nueva propiedad
│   │   │       │   └── [id]/
│   │   │       │       └── editar/
│   │   │       │           └── page.tsx  # Formulario edición
│   │   │       ├── categorias/
│   │   │       │   └── page.tsx
│   │   │       └── leads/
│   │   │           └── page.tsx          # Bandeja de contactos
│   │   │
│   │   ├── api/               # Route Handlers (API interna)
│   │   │   ├── propiedades/
│   │   │   │   ├── route.ts           # GET list, POST create
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts       # GET, PUT, DELETE by id
│   │   │   ├── upload/
│   │   │   │   └── route.ts           # Firma de upload a Cloudinary
│   │   │   └── leads/
│   │   │       └── route.ts           # POST contacto
│   │   │
│   │   ├── auth/              # Supabase Auth (rutas especiales)
│   │   │   └── callback/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx         # Root layout (fonts, providers)
│   │   ├── globals.css
│   │   └── robots.ts          # robots.txt dinámico
│   │
│   ├── components/
│   │   ├── ui/                # Componentes base (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   │
│   │   ├── property/          # Componentes de propiedad
│   │   │   ├── PropertyCard.tsx       # Tarjeta del listado
│   │   │   ├── PropertyGrid.tsx       # Grid de tarjetas
│   │   │   ├── PropertyFilters.tsx    # Filtros (precio, tipo, etc.)
│   │   │   ├── PropertyGallery.tsx    # Galería de fotos (lightbox)
│   │   │   ├── PropertyMap.tsx        # Mapa (Mapbox / Google Maps)
│   │   │   ├── PropertyFeatures.tsx   # Lista de características
│   │   │   ├── WhatsAppButton.tsx     # Botón deep link WhatsApp
│   │   │   └── StatusBadge.tsx        # Badge disponible/reservado/etc.
│   │   │
│   │   ├── admin/             # Componentes del panel admin
│   │   │   ├── PropertyForm.tsx       # Formulario completo (crear/editar)
│   │   │   ├── ImageUploader.tsx      # Drag & drop multi-imagen
│   │   │   ├── PhotoSortable.tsx      # Reordenar fotos (DnD)
│   │   │   ├── StatusToggle.tsx       # Switch de disponibilidad
│   │   │   ├── PropertiesTable.tsx    # Tabla con acciones
│   │   │   └── LeadsInbox.tsx         # Listado de contactos
│   │   │
│   │   └── layout/            # Header, Footer, Sidebar
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── AdminSidebar.tsx
│   │       └── MobileMenu.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts          # Singleton del cliente Prisma
│   │   ├── supabase/
│   │   │   ├── client.ts      # Supabase client (browser)
│   │   │   └── server.ts      # Supabase client (server/RSC)
│   │   ├── cloudinary.ts      # Configuración + helpers Cloudinary
│   │   ├── whatsapp.ts        # Generador de links de WhatsApp
│   │   └── seo.ts             # Helpers para metadata (generateMetadata)
│   │
│   ├── actions/               # Server Actions (Next.js)
│   │   ├── property.actions.ts    # CRUD de propiedades
│   │   ├── photo.actions.ts       # Gestión de fotos
│   │   └── lead.actions.ts        # Guardar contactos
│   │
│   ├── types/
│   │   ├── property.ts        # Tipos TypeScript (extends Prisma types)
│   │   └── supabase.ts        # Tipos generados por Supabase CLI
│   │
│   ├── hooks/                 # Custom React Hooks (client-side)
│   │   ├── useFilters.ts      # Estado de filtros del listado
│   │   └── useImageUpload.ts  # Lógica de subida a Cloudinary
│   │
│   └── constants/
│       ├── filters.ts         # Opciones de filtros (rangos de precio, etc.)
│       └── config.ts          # Config global (whatsapp default, etc.)
│
├── .env.local                 # Variables de entorno (no subir a git)
├── .env.example               # Plantilla de variables (sí subir a git)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Variables de Entorno (.env.example)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Prisma
DATABASE_URL=            # Connection pooling (pgBouncer)
DIRECT_URL=              # Conexión directa (para migraciones)

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# WhatsApp (número por defecto del agente)
NEXT_PUBLIC_WHATSAPP_PHONE=34600000000

# App
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```

---

## Decisiones de arquitectura clave

| Decisión | Motivo |
|---|---|
| `(public)` y `(admin)` como Route Groups | Layouts distintos sin afectar las URLs |
| Server Actions en `/actions` | Evita crear API routes para operaciones simples |
| `lib/prisma.ts` como singleton | Evita conexiones múltiples en desarrollo (hot reload) |
| Server Components por defecto | Mejor rendimiento y SEO; `"use client"` solo donde haga falta |
| `OperationType` como enum, `Category` como tabla | Los tipos de inmueble son fijos; las etiquetas editoriales cambian |
| Campos lat/lon en Property | Permite render del mapa sin geocoding en runtime |
| `whatsappPhone` por propiedad | Soporta agencias multi-agente en el futuro |
