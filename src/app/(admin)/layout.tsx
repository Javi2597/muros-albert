import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, List, PlusCircle, MessageSquare, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { NavItem } from '@/components/admin/NavItem'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Protección de ruta: redirige al login si no hay sesión
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Sidebar ── */}
      <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-gray-100 bg-white lg:flex">
        {/* Logo */}
        <div className="border-b border-gray-100 px-5 py-4">
          <Link href="/admin" className="text-base font-bold text-gray-900">
            Albert Inmo
          </Link>
          <p className="text-xs text-gray-400">Panel de administración</p>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <NavItem href="/admin" icon={<Home className="h-4 w-4" />} exact>
            Dashboard
          </NavItem>
          <NavItem href="/admin/propiedades" icon={<List className="h-4 w-4" />}>
            Propiedades
          </NavItem>
          <NavItem href="/admin/propiedades/nueva" icon={<PlusCircle className="h-4 w-4" />}>
            Nueva propiedad
          </NavItem>
          <NavItem href="/admin/leads" icon={<MessageSquare className="h-4 w-4" />}>
            Contactos
          </NavItem>
        </nav>

        {/* Usuario + logout */}
        <div className="border-t border-gray-100 p-3">
          <p className="mb-2 truncate px-2 text-xs text-gray-400">{user.email}</p>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* ── Contenido ── */}
      <main className="flex-1 overflow-auto">
        {/* Top bar móvil */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
          <span className="font-bold text-gray-900">Albert Inmo</span>
          {/* TODO: menú hamburguesa móvil */}
        </div>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}

// NavItem importado desde components/admin/NavItem.tsx ('use client')
