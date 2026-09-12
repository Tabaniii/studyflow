export const PRIORITIES = ['rendah', 'sedang', 'tinggi']

export const PRIORITY_WEIGHT = { tinggi: 3, sedang: 2, rendah: 1 }

export const PRIORITY_LABEL = {
  tinggi: 'Tinggi',
  sedang: 'Sedang',
  rendah: 'Rendah',
}

export const PRIORITY_STYLES = {
  tinggi: 'badge-brutal',
  sedang: 'badge-brutal',
  rendah: 'badge-brutal',
}

export const STATUSES = ['belum_mulai', 'dikerjakan', 'dikumpul', 'menunggu_nilai']

export const STATUS_LABEL = {
  belum_mulai: 'Belum mulai',
  dikerjakan: 'Sedang dikerjakan',
  dikumpul: 'Sudah dikumpul',
  menunggu_nilai: 'Menunggu nilai',
}

export const STATUS_STYLES = {
  belum_mulai: 'badge-brutal',
  dikerjakan: 'badge-brutal',
  dikumpul: 'badge-brutal',
  menunggu_nilai: 'badge-brutal',
}

export const ANNOUNCED_VIA = ['wa', 'classroom', 'lms', 'kelas', 'email', 'lainnya']

export const ANNOUNCED_VIA_LABEL = {
  wa: 'WhatsApp grup',
  classroom: 'Google Classroom',
  lms: 'LMS kampus',
  kelas: 'Dosen di kelas',
  email: 'Email',
  lainnya: 'Lainnya',
}

export const SUBMIT_VIA = ['lms', 'email', 'print', 'drive', 'presentasi', 'lainnya']

export const SUBMIT_VIA_LABEL = {
  lms: 'LMS',
  email: 'Email dosen',
  print: 'Print / fisik',
  drive: 'Google Drive',
  presentasi: 'Presentasi',
  lainnya: 'Lainnya',
}

export const FILE_FORMATS = ['pdf', 'docx', 'zip', 'github', 'bebas', 'lainnya']

export const FILE_FORMAT_LABEL = {
  pdf: 'PDF',
  docx: 'DOCX',
  zip: 'ZIP',
  github: 'Link GitHub',
  bebas: 'Bebas',
  lainnya: 'Lainnya',
}

export const TASK_TYPES = ['individu', 'kelompok']

export const TASK_TYPE_LABEL = {
  individu: 'Individu',
  kelompok: 'Kelompok',
}

export const RECURRENCES = ['tidak', 'harian', 'mingguan', 'bulanan']

export const RECURRENCE_LABEL = {
  tidak: 'Tidak berulang',
  harian: 'Setiap hari',
  mingguan: 'Setiap minggu',
  bulanan: 'Setiap bulan',
}

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000

export const CLOSED_STATUSES = ['dikumpul', 'menunggu_nilai']
export const URGENT_THRESHOLD_DAYS = 3
export const EMERGENCY_HOURS = 48

export function isClosedStatus(status) {
  return CLOSED_STATUSES.includes(status)
}

export function isTaskClosed(task) {
  return isClosedStatus(task.status) || Boolean(task.is_done && !task.status)
}

export function statusToDone(status) {
  return isClosedStatus(status)
}

function toLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function getDeadlineDate(task) {
  if (!task?.deadline) return null
  const [year, month, day] = String(task.deadline).split('-').map(Number)
  if (!year || !month || !day) return null
  const time = String(task.deadline_time || '23:59').slice(0, 5)
  const [hour, minute] = time.split(':').map(Number)
  const date = new Date(year, month - 1, day, hour || 0, minute || 0, 0)
  return Number.isNaN(date.getTime()) ? null : date
}

export function hoursUntilDeadline(task) {
  const date = getDeadlineDate(task)
  if (!date) return Number.POSITIVE_INFINITY
  return (date - Date.now()) / HOUR_MS
}

export function daysUntilDeadline(deadlineOrTask) {
  const deadline =
    typeof deadlineOrTask === 'string' ? deadlineOrTask : deadlineOrTask?.deadline
  if (!deadline) return Number.POSITIVE_INFINITY
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((toLocalDate(deadline) - startOfToday) / DAY_MS)
}

export function priorityFromWeight(weight) {
  const value = Number(weight)
  if (!Number.isFinite(value)) return 'sedang'
  if (value >= 40) return 'tinggi'
  if (value >= 15) return 'sedang'
  return 'rendah'
}

export const PRIORITY_TO_WEIGHT = { rendah: 10, sedang: 30, tinggi: 60 }

export function getEffectivePriority(task) {
  if (PRIORITIES.includes(task?.priority)) return task.priority
  return priorityFromWeight(task?.weight_percent)
}

export function isEmergency(task) {
  if (isTaskClosed(task)) return false
  const hours = hoursUntilDeadline(task)
  return hours >= 0 && hours <= EMERGENCY_HOURS
}

export function getUrgency(task) {
  if (isTaskClosed(task)) return 'selesai'
  const hours = hoursUntilDeadline(task)
  if (hours < 0) return 'terlambat'
  if (hours <= EMERGENCY_HOURS) return 'mendekati'
  const days = daysUntilDeadline(task)
  if (days <= URGENT_THRESHOLD_DAYS) return 'mendekati'
  return 'aman'
}

export const URGENCY_CONFIG = {
  terlambat: {
    label: 'Terlambat',
    badge: 'badge-brutal badge-ink',
    accent: '',
  },
  mendekati: {
    label: 'Mendekati Deadline',
    badge: 'badge-brutal badge-yellow',
    accent: '',
  },
  aman: {
    label: 'Aman',
    badge: 'badge-brutal badge-green',
    accent: '',
  },
  selesai: {
    label: 'Selesai',
    badge: 'badge-brutal badge-green',
    accent: '',
  },
}

export function formatDuration(hours) {
  if (!Number.isFinite(hours)) return '—'
  const abs = Math.abs(hours)
  if (abs < 1) {
    const minutes = Math.max(1, Math.round(abs * 60))
    return `${minutes} menit`
  }
  if (abs < 24) {
    const whole = Math.floor(abs)
    const minutes = Math.round((abs - whole) * 60)
    return minutes ? `${whole} jam ${minutes} menit` : `${whole} jam`
  }
  const days = Math.floor(abs / 24)
  const remainHours = Math.round(abs % 24)
  return remainHours ? `${days} hari ${remainHours} jam` : `${days} hari`
}

export function formatDeadlineLabel(task) {
  if (isTaskClosed(task)) return `${formatDate(task.deadline)} ${formatTime(task.deadline_time)}`
  const hours = hoursUntilDeadline(task)
  if (hours < 0) return `Terlambat ${formatDuration(hours)}`
  if (hours < 1) return `${formatDuration(hours)} lagi`
  if (hours < 24) return `${formatDuration(hours)} lagi`
  const days = daysUntilDeadline(task)
  if (days === 0) return 'Deadline hari ini'
  if (days === 1) return 'Deadline besok'
  return `${days} hari lagi`
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(toLocalDate(dateString))
}

export function formatTime(timeValue) {
  if (!timeValue) return '23.59'
  const slice = String(timeValue).slice(0, 5)
  return slice.replace(':', '.')
}

export function getTimeBudget(task) {
  const remaining = hoursUntilDeadline(task)
  const estimate = task.estimated_hours == null || task.estimated_hours === ''
    ? null
    : Number(task.estimated_hours)
  const hasEstimate = Number.isFinite(estimate) && estimate > 0
  return {
    remaining,
    estimate: hasEstimate ? estimate : null,
    overshoot: hasEstimate && !isTaskClosed(task) && remaining >= 0 && estimate > remaining,
  }
}

export function nextDeadline(deadline, recurrence) {
  const [year, month, day] = String(deadline).split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (recurrence === 'harian') date.setDate(date.getDate() + 1)
  else if (recurrence === 'mingguan') date.setDate(date.getDate() + 7)
  else if (recurrence === 'bulanan') date.setMonth(date.getMonth() + 1)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function parseMembers(value) {
  if (!value) return []
  return String(value)
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
}

export function contextLine(task) {
  const announced = ANNOUNCED_VIA_LABEL[task.announced_via] || 'Sumber belum diisi'
  const submit = SUBMIT_VIA_LABEL[task.submit_via] || 'Kumpul belum diisi'
  const format = FILE_FORMAT_LABEL[task.file_format]
  return format && task.file_format !== 'bebas'
    ? `Diumumkan di ${announced} · Kumpul ${submit} · ${format}`
    : `Diumumkan di ${announced} · Kumpul ${submit}`
}

const COPY_FIELDS = [
  'title',
  'course',
  'deadline_time',
  'weight_percent',
  'estimated_hours',
  'description',
  'announced_via',
  'source_link',
  'submit_via',
  'file_format',
  'task_type',
  'members',
  'pic_name',
  'recurrence',
]

export function buildSpawnedTask(task) {
  const deadline = nextDeadline(task.deadline, task.recurrence)
  const next = {
    title: task.title,
    course: task.course,
    deadline,
    deadline_time: task.deadline_time || '23:59',
    weight_percent: PRIORITY_TO_WEIGHT[getEffectivePriority(task)] ?? task.weight_percent ?? 30,
    estimated_hours: task.estimated_hours ?? null,
    description: task.description || '',
    announced_via: task.announced_via || 'lainnya',
    source_link: task.source_link || '',
    submit_via: task.submit_via || 'lms',
    file_format: task.file_format || 'bebas',
    task_type: task.task_type || 'individu',
    members: task.members || '',
    pic_name: task.pic_name || '',
    recurrence: task.recurrence,
    series_id: task.series_id || task.id,
    spawned_next: false,
    status: 'belum_mulai',
    is_done: false,
    priority: getEffectivePriority(task),
  }
  return next
}

export function shouldSpawnNext(task) {
  return (
    task.recurrence &&
    task.recurrence !== 'tidak' &&
    !task.spawned_next &&
    isTaskClosed(task)
  )
}

export function toTaskPayload(form) {
  const status = form.status || 'belum_mulai'
  const priority = PRIORITIES.includes(form.priority) ? form.priority : 'sedang'
  const payload = {
    title: form.title.trim(),
    course: form.course.trim(),
    deadline: form.deadline,
    deadline_time: form.deadline_time || '23:59',
    priority,
    weight_percent: PRIORITY_TO_WEIGHT[priority],
    estimated_hours:
      form.estimated_hours === '' || form.estimated_hours == null
        ? null
        : Number(form.estimated_hours),
    status,
    is_done: statusToDone(status),
    description: (form.description || '').trim(),
    announced_via: form.announced_via || 'lainnya',
    source_link: (form.source_link || '').trim(),
    submit_via: form.submit_via || 'lms',
    file_format: form.file_format || 'bebas',
    task_type: form.task_type || 'individu',
    members: form.task_type === 'kelompok' ? (form.members || '').trim() : '',
    pic_name: form.task_type === 'kelompok' ? (form.pic_name || '').trim() : '',
    recurrence: form.recurrence || 'tidak',
  }
  return payload
}

export { COPY_FIELDS }
