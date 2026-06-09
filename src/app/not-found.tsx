import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-bold text-gray-200">404</p>
      <h1 className="mt-4 text-lg font-semibold text-gray-800">Página no encontrada</h1>
      <p className="mt-2 text-sm text-gray-500">
        La propiedad o página que buscas no existe o ha sido eliminada.
      </p>
      <Link
        href="/propiedades"
        className="mt-6 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition"
      >
        Ver todas las propiedades
      </Link>
    </div>
  )
}
