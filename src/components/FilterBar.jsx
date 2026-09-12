const FILTERS = [
  { value: 'semua', label: 'Semua' },
  { value: 'aktif', label: 'Aktif' },
  { value: 'darurat', label: 'Darurat 48 jam' },
  { value: 'mendekati', label: 'Mendekati' },
  { value: 'terlambat', label: 'Terlambat' },
  { value: 'belum_mulai', label: 'Belum mulai' },
  { value: 'dikerjakan', label: 'Dikerjakan' },
  { value: 'dikumpul', label: 'Dikumpul' },
  { value: 'menunggu_nilai', label: 'Menunggu nilai' },
  { value: 'selesai', label: 'Selesai' },
]

export default function FilterBar({ filter, onFilterChange, sort, onSortChange }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
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
          <option value="estimasi">Estimasi terlama</option>
        </select>
      </label>
    </div>
  )
}
