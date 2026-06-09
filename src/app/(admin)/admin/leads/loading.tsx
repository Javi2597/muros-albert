export default function LeadsLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-7 w-40 rounded-lg bg-gray-200" />
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-4 w-36 rounded bg-gray-200" />
                <div className="h-3 w-48 rounded bg-gray-100" />
                <div className="mt-1 h-16 w-full rounded-xl bg-gray-100" />
                <div className="h-3 w-24 rounded bg-gray-100" />
              </div>
              <div className="h-8 w-28 rounded-lg bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
