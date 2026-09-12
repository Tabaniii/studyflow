import {
  URGENCY_CONFIG,
  PRIORITY_LABEL,
  PRIORITY_STYLES,
  STATUS_LABEL,
  STATUS_STYLES,
  STATUSES,
  RECURRENCE_LABEL,
  TASK_TYPE_LABEL,
  getUrgency,
  getEffectivePriority,
  formatDeadlineLabel,
  formatDate,
  formatTime,
  formatDuration,
  getTimeBudget,
  isEmergency,
  contextLine,
  parseMembers,
} from '../utils/taskUtils'
import RitualChecklist from './RitualChecklist'
import AttachmentThumbs from './AttachmentThumbs'

export default function TaskItem({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  onFocus,
  onRitualToggle,
  onDeleteAttachment,
}) {
  const urgency = getUrgency(task)
  const config = URGENCY_CONFIG[urgency]
  const priority = getEffectivePriority(task)
  const budget = getTimeBudget(task)
  const members = parseMembers(task.members)
  const emergency = isEmergency(task)
  const status = task.status || (task.is_done ? 'dikumpul' : 'belum_mulai')

  return (
    <li
      className={`rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm transition ${config.accent} ${
        urgency === 'selesai' ? 'opacity-80' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <select
          value={status}
          onChange={(event) => onStatusChange(task, event.target.value)}
          aria-label={`Status ${task.title}`}
          className={`mt-0.5 w-[10.5rem] shrink-0 rounded-lg border px-2 py-1 text-[11px] font-semibold outline-none focus:ring-2 focus:ring-indigo-500 ${STATUS_STYLES[status]}`}
        >
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABEL[value]}
            </option>
          ))}
        </select>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-800">{task.title}</h3>
            {emergency && (
              <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                Darurat 48 jam
              </span>
            )}
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${config.badge}`}
            >
              {config.label}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLES[priority]}`}
            >
              Prioritas {PRIORITY_LABEL[priority].toLowerCase()}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {task.course} · {formatDeadlineLabel(task)}
            {` (${formatDate(task.deadline)} ${formatTime(task.deadline_time)})`}
          </p>

          <p className="mt-1 text-xs text-slate-500">{contextLine(task)}</p>

          {task.description && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{task.description}</p>
          )}

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
            {task.task_type === 'kelompok' && (
              <span>
                {TASK_TYPE_LABEL.kelompok}
                {members.length > 0 ? `: ${members.join(', ')}` : ''}
                {task.pic_name ? ` · PIC ${task.pic_name}` : ''}
              </span>
            )}
            {task.recurrence && task.recurrence !== 'tidak' && (
              <span>{RECURRENCE_LABEL[task.recurrence]}</span>
            )}
            {budget.estimate != null && (
              <span className={budget.overshoot ? 'font-semibold text-red-600' : ''}>
                Estimasi {formatDuration(budget.estimate)}
                {urgency !== 'selesai' && budget.remaining >= 0
                  ? ` · sisa ${formatDuration(budget.remaining)}`
                  : ''}
                {budget.overshoot ? ' — waktu tidak cukup' : ''}
              </span>
            )}
            {task.source_link && (
              <a
                href={task.source_link}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-indigo-600 hover:underline"
              >
                Buka sumber
              </a>
            )}
          </div>

          <AttachmentThumbs attachments={task.attachments} onDelete={onDeleteAttachment} />
          <RitualChecklist task={task} onToggle={onRitualToggle} />
        </div>

        <div className="flex shrink-0 flex-col gap-1">
          <button
            onClick={() => onFocus(task)}
            aria-label={`Fokus ${task.title}`}
            className="rounded-lg px-2 py-1 text-sm text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            Fokus
          </button>
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
      </div>
    </li>
  )
}
