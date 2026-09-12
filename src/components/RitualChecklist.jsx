import { formatDeadlineLabel } from '../utils/taskUtils'
import { isRitualDue, ritualItems, ritualProgress } from '../utils/tonight'

export default function RitualChecklist({ task, onToggle }) {
  if (!isRitualDue(task)) return null
  const items = ritualItems(task)
  const checks = task.ritual_checks && typeof task.ritual_checks === 'object' ? task.ritual_checks : {}
  const progress = ritualProgress(task)

  return (
    <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3">
      <p className="text-xs font-semibold text-orange-900">
        Ritual kumpul · {formatDeadlineLabel(task)} · {progress.done}/{progress.total}
      </p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li key={item.key}>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-orange-950">
              <input
                type="checkbox"
                checked={Boolean(checks[item.key])}
                onChange={(event) => onToggle(task, item.key, event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-orange-600"
              />
              <span className={checks[item.key] ? 'text-orange-800/70 line-through' : ''}>
                {item.label}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function RitualBanner({ tasks, onFocus }) {
  const due = (tasks || []).filter(isRitualDue)
  if (due.length === 0) return null
  const first = due[0]

  return (
    <button
      type="button"
      onClick={() => onFocus(first)}
      className="w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-left text-sm text-orange-950 transition hover:bg-orange-100"
    >
      <span className="font-semibold">Ritual kumpul:</span> {due.length} tugas deadline ≤ 2 jam.
      Cek PDF, nama file, dan tempat kumpul sebelum kelewat.
    </button>
  )
}
