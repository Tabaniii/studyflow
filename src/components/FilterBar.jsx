const FILTERS = [
  { value: 'semua', label: 'Semua' },
  { value: 'belum', label: 'Belum Selesai' },
  { value: 'selesai', label: 'Selesai' },
]

export default function FilterBar({ filter, onFilterChange, sort, onSortChange }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            onClick={() => onFilterChange(item.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              filter === item.value
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        Urutkan:
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="deadline">Deadline terdekat</option>
          <option value="prioritas">Prioritas tertinggi</option>
        </select>
      </label>
    </div>
  )
}
