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
    <div className="flex flex-col gap-4 overflow-visible pb-2 lg:flex-row lg:items-center lg:justify-between lg:pb-0">
      <div className="card-brutal flex flex-wrap gap-2 overflow-visible p-3">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            onClick={() => onFilterChange(item.value)}
            className={`btn-brutal btn-brutal-sm ${
              filter === item.value ? 'btn-brutal-ink' : ''
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <label className="caption-brutal flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        Urutkan:
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
          className="input-brutal font-bold sm:!w-auto"
        >
          <option value="deadline">Deadline terdekat</option>
          <option value="prioritas">Prioritas tertinggi</option>
          <option value="estimasi">Estimasi terlama</option>
        </select>
      </label>
    </div>
  )
}
