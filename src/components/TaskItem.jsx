import {
  URGENCY_CONFIG,
  PRIORITY_LABEL,
  PRIORITY_STYLES,
  STATUS_LABEL,
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
    <li className="card-brutal min-w-0 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <select
          value={status}
          onChange={(event) => onStatusChange(task, event.target.value)}
          aria-label={`Status ${task.title}`}
          className="input-brutal caption-brutal order-2 w-full py-2 lg:order-1 lg:!w-52 lg:flex-none"
        >
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABEL[value]}
            </option>
          ))}
        </select>

        <div className="order-1 min-w-0 flex-1 lg:order-2">
          <h3 className="text-xl font-extrabold leading-tight break-words">{task.title}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {emergency && <span className="badge-brutal badge-orange">Darurat 48 jam</span>}
            <span className={config.badge}>{config.label}</span>
            <span className={PRIORITY_STYLES[priority]}>
              Prioritas {PRIORITY_LABEL[priority].toLowerCase()}
            </span>
          </div>

          <p className="mt-2 font-bold break-words">
            {task.course} · {formatDeadlineLabel(task)}
            {` (${formatDate(task.deadline)} ${formatTime(task.deadline_time)})`}
          </p>

          <p className="mt-1 font-medium break-words">{contextLine(task)}</p>

          {task.description && (
            <p className="mt-2 line-clamp-2 break-words">{task.description}</p>
          )}

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm font-bold">
            {task.task_type === 'kelompok' && (
              <span className="break-words">
                {TASK_TYPE_LABEL.kelompok}
                {members.length > 0 ? `: ${members.join(', ')}` : ''}
                {task.pic_name ? ` · PIC ${task.pic_name}` : ''}
              </span>
            )}
            {task.recurrence && task.recurrence !== 'tidak' && (
              <span>{RECURRENCE_LABEL[task.recurrence]}</span>
            )}
            {budget.estimate != null && (
              <span className={budget.overshoot ? 'badge-brutal badge-orange' : ''}>
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
                className="heading-underline font-extrabold"
              >
                Buka sumber
              </a>
            )}
          </div>

          <AttachmentThumbs attachments={task.attachments} onDelete={onDeleteAttachment} />
          <RitualChecklist task={task} onToggle={onRitualToggle} />
        </div>

        <div className="order-3 grid grid-cols-3 gap-2 lg:flex lg:w-28 lg:flex-none lg:flex-col">
          <button
            onClick={() => onFocus(task)}
            aria-label={`Fokus ${task.title}`}
            className="btn-brutal btn-brutal-sm btn-brutal-yellow w-full"
          >
            Fokus
          </button>
          <button
            onClick={() => onEdit(task)}
            aria-label={`Edit ${task.title}`}
            className="btn-brutal btn-brutal-sm w-full"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task)}
            aria-label={`Hapus ${task.title}`}
            className="btn-brutal btn-brutal-sm btn-brutal-primary w-full"
          >
            Hapus
          </button>
        </div>
      </div>
    </li>
  )
}
