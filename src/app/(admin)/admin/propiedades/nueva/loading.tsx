export default function NuevaPropiedadLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-7 w-48 rounded-lg bg-gray-200" />
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-3.5 w-24 rounded bg-gray-200" />
              <div className="h-10 w-full rounded-xl bg-gray-100" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <div className="h-3.5 w-24 rounded bg-gray-200" />
          <div className="h-32 w-full rounded-xl bg-gray-100" />
        </div>
        <div className="mt-6 h-10 w-32 rounded-xl bg-gray-200" />
      </div>
    </div>
  )
}
