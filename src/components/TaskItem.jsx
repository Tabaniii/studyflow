import {
  URGENCY_CONFIG,
  PRIORITY_LABEL,
  PRIORITY_STYLES,
  getUrgency,
  formatDeadlineLabel,
  formatDate,
} from '../utils/taskUtils'

export default function TaskItem({ task, onToggleDone, onEdit, onDelete }) {
  const urgency = getUrgency(task)
  const config = URGENCY_CONFIG[urgency]

  return (
    <li
      className={`flex items-start gap-3 rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm transition ${config.accent} ${
        task.is_done ? 'opacity-70' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={task.is_done}
        onChange={() => onToggleDone(task)}
        aria-label={`Tandai ${task.title} ${task.is_done ? 'belum selesai' : 'selesai'}`}
        className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 accent-indigo-600"
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={`font-semibold text-slate-800 ${
              task.is_done ? 'line-through decoration-slate-400' : ''
            }`}
          >
            {task.title}
          </h3>
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${config.badge}`}
          >
            {config.label}
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLES[task.priority]}`}
          >
            {PRIORITY_LABEL[task.priority]}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {task.course} · {formatDeadlineLabel(task)}
          {task.is_done ? '' : ` (${formatDate(task.deadline)})`}
        </p>
      </div>

      <div className="flex shrink-0 gap-1">
        <button
          onClick={() => onEdit(task)}
          aria-label={`Edit ${task.title}`}
          className="rounded-lg px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task)}
          aria-label={`Hapus ${task.title}`}
          className="rounded-lg px-2 py-1 text-sm text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        >
          Hapus
        </button>
      </div>
    </li>
  )
}
