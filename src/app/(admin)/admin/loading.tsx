export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-7 w-32 rounded-lg bg-gray-200" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="h-8 w-12 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-24 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="h-5 w-5 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-28 rounded bg-gray-200" />
              <div className="mt-1 h-3 w-36 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-4 w-48 rounded bg-gray-200" />
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b border-gray-50 px-5 py-3.5 last:border-0">
              <div className="flex flex-col gap-1.5">
                <div className="h-4 w-48 rounded bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-100" />
              </div>
              <div className="h-4 w-12 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
