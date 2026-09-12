const CARDS = [
  { key: 'aktif', filter: 'aktif', label: 'Tugas Aktif', fill: 'bg-surface text-ink', tile: 'bg-surface', mark: 'A' },
  { key: 'darurat', filter: 'darurat', label: 'Darurat 48 Jam', fill: 'bg-brutal-orange text-ink', tile: 'bg-surface', mark: '!' },
  { key: 'mendekati', filter: 'mendekati', label: 'Mendekati Deadline', fill: 'bg-brutal-yellow text-ink', tile: 'bg-surface', mark: '~' },
  { key: 'terlambat', filter: 'terlambat', label: 'Terlambat', fill: 'bg-ink text-surface', tile: 'bg-brutal-orange text-ink', mark: 'X' },
  { key: 'selesai', filter: 'selesai', label: 'Sudah Dikumpul', fill: 'bg-brutal-green text-ink', tile: 'bg-surface', mark: 'OK' },
]

export default function DashboardStats({ stats, onFilterChange }) {
  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {CARDS.map((card) => (
        <button
          key={card.key}
          type="button"
          onClick={() => onFilterChange?.(card.filter)}
          className={`brutal-border brutal-shadow brutal-radius-md brutal-press min-w-0 p-3 text-left sm:p-4 ${card.fill}`}
        >
          <span className={`icon-tile mb-3 ${card.tile}`}>{card.mark}</span>
          <p className="font-display text-[clamp(32px,5vw,48px)] leading-none">
            {stats[card.key] ?? 0}
          </p>
          <p className="caption-brutal mt-2">{card.label}</p>
        </button>
      ))}
    </section>
  )
}
