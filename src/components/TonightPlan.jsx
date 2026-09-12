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
    <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-800">Malam ini ngerjain apa?</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Sisa ± {formatDuration(plan.availableHours)} sampai jam tidur {formatClock(sleepTime)}.
          </p>
        </div>
      </div>

      {plan.picks.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">Tidak ada tugas aktif. Bisa istirahat atau review materi.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {plan.picks.map((pick, index) => (
            <li
              key={pick.task.id}
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  {index + 1}. {pick.task.title}
                  <span className="ml-2 font-medium text-slate-400">{pick.task.course}</span>
                </p>
                <p className={`mt-0.5 text-xs ${pick.fit ? 'text-slate-500' : 'font-medium text-red-600'}`}>
                  {pick.assumed ? `Asumsi ${formatDuration(pick.hours)} · ` : `Estimasi ${formatDuration(pick.hours)} · `}
                  {pick.reason}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => onOpenTask(pick.task)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Detail
                </button>
                <button
                  type="button"
                  onClick={() => onFocus(pick.task)}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
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
