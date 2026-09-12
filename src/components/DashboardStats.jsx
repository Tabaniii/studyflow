const CARDS = [
  { key: 'aktif', filter: 'aktif', label: 'Tugas Aktif', style: 'bg-white text-slate-800 border-slate-200' },
  { key: 'darurat', filter: 'darurat', label: 'Darurat 48 Jam', style: 'bg-orange-50 text-orange-800 border-orange-200' },
  { key: 'mendekati', filter: 'mendekati', label: 'Mendekati Deadline', style: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  { key: 'terlambat', filter: 'terlambat', label: 'Terlambat', style: 'bg-red-50 text-red-800 border-red-200' },
  { key: 'selesai', filter: 'selesai', label: 'Sudah Dikumpul', style: 'bg-green-50 text-green-800 border-green-200' },
]

export default function DashboardStats({ stats, onFilterChange }) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CARDS.map((card) => (
        <button
          key={card.key}
          type="button"
          onClick={() => onFilterChange?.(card.filter)}
          className={`rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow ${card.style}`}
        >
          <p className="text-3xl font-bold">{stats[card.key] ?? 0}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide opacity-80">
            {card.label}
          </p>
        </button>
      ))}
    </section>
  )
}
