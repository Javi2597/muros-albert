# Guía de puesta en marcha — Albert Inmo

## 1. Instalar dependencias

```bash
pnpm install
```

## 2. Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env con tus credenciales reales
```

## 3. Base de datos local (desarrollo)

Requiere Docker:

```bash
docker compose up -d        # arranca PostgreSQL en localhost:5432
pnpm exec prisma generate   # genera el cliente Prisma
pnpm exec prisma migrate dev # crea las tablas
```

## 4. Base de datos en producción (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **Settings → API** y copia las URLs y keys en `.env`
3. En **Settings → Database → Connection string** copia `DATABASE_URL` y `DIRECT_URL`
4. Ejecuta las migraciones apuntando a Supabase:
   ```bash
   pnpm exec prisma migrate deploy
   ```

## 5. Configurar Supabase Auth

1. Ve a **Authentication → Email** y activa **Magic Link**
2. En **Authentication → URL Configuration** añade:
   - Site URL: `https://tudominio.com`
   - Redirect URLs: `https://tudominio.com/auth/callback`

## 6. Configurar Cloudinary

1. Crea una cuenta en [cloudinary.com](https://cloudinary.com)
2. En el Dashboard copia `Cloud name`, `API Key` y `API Secret`

## 7. Arrancar en desarrollo

```bash
pnpm dev
# → http://localhost:3000          Portal público
# → http://localhost:3000/admin    Panel admin
# → http://localhost:3000/login    Login (magic link)
```

## 8. Despliegue en Vercel

Conecta el repo de GitHub en Vercel y añade las variables de `.env` en:
**Vercel → Project → Settings → Environment Variables**

> Vercel ya ejecuta `pnpm install` y `pnpm build` automáticamente.

---

## Rutas del proyecto

| URL | Descripción |
|-----|-------------|
| `/` | Home con propiedades destacadas |
| `/propiedades` | Listado completo |
| `/propiedades/[slug]` | Ficha de propiedad |
| `/login` | Acceso al panel (magic link) |
| `/admin` | Dashboard |
| `/admin/propiedades` | Gestión de propiedades |
| `/admin/propiedades/nueva` | Crear propiedad |
| `/admin/propiedades/[id]/editar` | Editar propiedad |

## Primer acceso al panel

1. Ve a `/login`
2. Introduce el email del administrador
3. Abre el email → haz clic en el enlace
4. Ya estás dentro del panel

No hay contraseña que recordar — Supabase envía un enlace nuevo cada vez.
