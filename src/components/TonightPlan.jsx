import { formatDuration } from '../utils/taskUtils'
import { formatClock } from '../utils/studyTime'

export default function TonightPlan({
  plan,
  sleepTime,
  onFocus,
  onOpenTask,
}) {
  if (!plan) return null

  return (
    <section className="card-insight insight-brutal p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="caption-brutal">Rencana malam</p>
          <h2 className="font-display mt-1 text-[clamp(24px,3vw,40px)]">
            Malam ini ngerjain apa?
          </h2>
          <p className="mt-2 font-bold">
            Sisa sampai jam tidur {formatClock(sleepTime)}
          </p>
        </div>
        <p className="font-display text-[clamp(40px,6vw,56px)] leading-none">
          {Math.max(0, Math.round(plan.availableHours * 10) / 10)}
          <span className="caption-brutal ml-2 inline-block align-middle">jam</span>
        </p>
      </div>

      {plan.picks.length === 0 ? (
        <p className="mt-4 font-bold">Tidak ada tugas aktif. Bisa istirahat atau review materi.</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {plan.picks.map((pick, index) => (
            <li
              key={pick.task.id}
              className="brutal-border brutal-radius-md flex flex-col gap-3 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-xl font-extrabold leading-tight">
                  {index + 1}. {pick.task.title}
                  <span className="ml-2 font-bold">{pick.task.course}</span>
                </p>
                <p className={`mt-1 font-bold ${pick.fit ? '' : 'bg-brutal-orange inline-block px-2'}`}>
                  {pick.assumed ? `Asumsi ${formatDuration(pick.hours)} · ` : `Estimasi ${formatDuration(pick.hours)} · `}
                  {pick.reason}
                </p>
              </div>
              <div className="flex min-w-0 shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onOpenTask(pick.task)}
                  className="btn-brutal btn-brutal-sm"
                >
                  Detail
                </button>
                <button
                  type="button"
                  onClick={() => onFocus(pick.task)}
                  className="btn-brutal btn-brutal-sm btn-brutal-primary"
                >
                  Mulai fokus
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
