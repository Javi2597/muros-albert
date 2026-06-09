export default function PropiedadesLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-48 rounded-lg bg-gray-200" />
        <div className="h-10 w-36 rounded-xl bg-gray-200" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
          <div className="h-3 w-64 rounded bg-gray-200" />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center justify-between border-b border-gray-50 px-5 py-4 last:border-0">
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-56 rounded bg-gray-200" />
              <div className="h-3 w-32 rounded bg-gray-100" />
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden h-4 w-20 rounded bg-gray-100 sm:block" />
              <div className="hidden h-6 w-20 rounded-full bg-gray-100 lg:block" />
              <div className="h-7 w-16 rounded-lg bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
