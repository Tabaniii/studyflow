const CARDS = [
  { key: 'aktif', label: 'Tugas Aktif', style: 'bg-white text-slate-800 border-slate-200' },
  { key: 'mendekati', label: 'Mendekati Deadline', style: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  { key: 'terlambat', label: 'Terlambat', style: 'bg-red-50 text-red-800 border-red-200' },
  { key: 'selesai', label: 'Selesai', style: 'bg-green-50 text-green-800 border-green-200' },
]

export default function DashboardStats({ stats }) {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CARDS.map((card) => (
        <div key={card.key} className={`rounded-xl border p-4 shadow-sm ${card.style}`}>
          <p className="text-3xl font-bold">{stats[card.key]}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide opacity-80">
            {card.label}
          </p>
        </div>
      ))}
    </section>
  )
}
