import { formatDeadlineLabel } from '../utils/taskUtils'
import { isRitualDue, ritualItems, ritualProgress } from '../utils/tonight'

export default function RitualChecklist({ task, onToggle }) {
  if (!isRitualDue(task)) return null
  const items = ritualItems(task)
  const checks = task.ritual_checks && typeof task.ritual_checks === 'object' ? task.ritual_checks : {}
  const progress = ritualProgress(task)

  return (
    <div className="brutal-border brutal-radius-md mt-3 w-full min-w-0 bg-brutal-orange p-3">
      <p className="caption-brutal break-words">
        Ritual kumpul · {formatDeadlineLabel(task)} · {progress.done}/{progress.total}
      </p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item.key}>
            <label className="flex cursor-pointer items-start gap-2 font-bold">
              <input
                type="checkbox"
                checked={Boolean(checks[item.key])}
                onChange={(event) => onToggle(task, item.key, event.target.checked)}
                className="mt-1 h-5 w-5 accent-[var(--ink)]"
              />
              <span className={checks[item.key] ? 'break-words line-through' : 'break-words'}>
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
      className="card-cta brutal-press w-full px-4 py-4 text-left"
    >
      <span className="caption-brutal">Ritual kumpul</span>
      <p className="mt-1 text-[clamp(20px,2.4vw,28px)] font-extrabold leading-tight">
        {due.length} tugas deadline ≤ 2 jam
      </p>
      <p className="mt-1 font-bold">Cek PDF, nama file, dan tempat kumpul sebelum kelewat.</p>
    </button>
  )
}
