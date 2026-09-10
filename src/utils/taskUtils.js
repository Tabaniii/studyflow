export const PRIORITIES = ['rendah', 'sedang', 'tinggi']

export const PRIORITY_WEIGHT = { tinggi: 3, sedang: 2, rendah: 1 }

export const PRIORITY_LABEL = {
  tinggi: 'Tinggi',
  sedang: 'Sedang',
  rendah: 'Rendah',
}

export const PRIORITY_STYLES = {
  tinggi: 'bg-rose-100 text-rose-700 border-rose-200',
  sedang: 'bg-amber-100 text-amber-700 border-amber-200',
  rendah: 'bg-sky-100 text-sky-700 border-sky-200',
}

const DAY_MS = 24 * 60 * 60 * 1000

function toLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function daysUntilDeadline(deadline) {
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((toLocalDate(deadline) - startOfToday) / DAY_MS)
}

// ambang hari untuk status "mendekati deadline"
export const URGENT_THRESHOLD_DAYS = 3

export function getUrgency(task) {
  if (task.is_done) return 'selesai'
  const days = daysUntilDeadline(task.deadline)
  if (days < 0) return 'terlambat'
  if (days <= URGENT_THRESHOLD_DAYS) return 'mendekati'
  return 'aman'
}

export const URGENCY_CONFIG = {
  terlambat: {
    label: 'Terlambat',
    badge: 'bg-red-100 text-red-700 border-red-200',
    accent: 'border-l-red-500',
  },
  mendekati: {
    label: 'Mendekati Deadline',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    accent: 'border-l-yellow-400',
  },
  aman: {
    label: 'Aman',
    badge: 'bg-green-100 text-green-700 border-green-200',
    accent: 'border-l-green-500',
  },
  selesai: {
    label: 'Selesai',
    badge: 'bg-slate-200 text-slate-600 border-slate-300',
    accent: 'border-l-slate-300',
  },
}

export function formatDeadlineLabel(task) {
  if (task.is_done) return formatDate(task.deadline)
  const days = daysUntilDeadline(task.deadline)
  if (days < 0) return `Terlambat ${Math.abs(days)} hari`
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
