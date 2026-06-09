import Link from 'next/link'
import { Phone } from 'lucide-react'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? ''

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}

// ── Header ────────────────────────────────────────────────────────
function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-lg font-bold text-gray-900 tracking-tight">Albert Inmo</span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
            Inmobiliaria
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-6 sm:flex">
          <NavLink href="/propiedades">Propiedades</NavLink>
          <NavLink href="/propiedades?type=SALE">Venta</NavLink>
          <NavLink href="/propiedades?type=RENT">Alquiler</NavLink>
          <NavLink href="/contacto">Contacto</NavLink>
        </nav>

        {/* CTA WhatsApp */}
        {WHATSAPP && (
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1ebe5d]"
          >
            <Phone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        )}
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-gray-600 transition hover:text-gray-900"
    >
      {children}
    </Link>
  )
}

// ── Footer ────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-gray-100 bg-gray-50 py-8 text-center text-xs text-gray-400">
      <p>© {year} Albert Inmo · Todos los derechos reservados</p>
      <p className="mt-1">
        <a href="/admin" className="hover:text-gray-600 transition">
          Acceso privado
        </a>
      </p>
    </footer>
  )
}
