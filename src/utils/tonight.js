import {
  PRIORITY_WEIGHT,
  SUBMIT_VIA_LABEL,
  formatDuration,
  getEffectivePriority,
  hoursUntilDeadline,
  isEmergency,
  isTaskClosed,
} from './taskUtils'
import { parseStudyMinutes } from './studyTime'

export const RITUAL_WINDOW_HOURS = 2
export const DEFAULT_SLEEP_TIME = '23:00'
export const DEFAULT_TASK_HOURS = 1
export const MAX_TONIGHT_PICKS = 3

export function hoursUntilBed(sleepTime = DEFAULT_SLEEP_TIME, now = new Date()) {
  const bed = parseStudyMinutes(sleepTime) ?? parseStudyMinutes(DEFAULT_SLEEP_TIME)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  if (nowMinutes < bed) return (bed - nowMinutes) / 60
  return 2
}

export function getAvailableTonightHours({ sleepTime, session } = {}, now = new Date()) {
  if (session?.phase === 'active' && session.minutesLeft > 0) {
    return session.minutesLeft / 60
  }
  return hoursUntilBed(sleepTime || DEFAULT_SLEEP_TIME, now)
}

export function taskEffortHours(task) {
  const estimate = Number(task?.estimated_hours)
  if (Number.isFinite(estimate) && estimate > 0) return estimate
  return DEFAULT_TASK_HOURS
}

function rankTonight(a, b) {
  const aEmer = isEmergency(a) ? 0 : 1
  const bEmer = isEmergency(b) ? 0 : 1
  if (aEmer !== bEmer) return aEmer - bEmer
  const byPriority = PRIORITY_WEIGHT[getEffectivePriority(b)] - PRIORITY_WEIGHT[getEffectivePriority(a)]
  if (byPriority !== 0) return byPriority
  return hoursUntilDeadline(a) - hoursUntilDeadline(b)
}

function pickReason(task, hours, fit) {
  if (!fit) {
    return `Estimasi ${formatDuration(hours)}, sisa malam lebih pendek. Kerjakan sebagian dulu.`
  }
  if (isEmergency(task)) return 'Masuk jendela darurat 48 jam'
  if (getEffectivePriority(task) === 'tinggi') return 'Prioritas tinggi dan masih muat malam ini'
  return 'Muat dikerjakan sebelum jam tidur'
}

export function planTonight(tasks, availableHours) {
  const safeHours = Math.max(Number(availableHours) || 0, 0.25)
  const ranked = (tasks || []).filter((task) => !isTaskClosed(task)).sort(rankTonight)
  const picks = []
  let remaining = safeHours

  for (const task of ranked) {
    if (picks.length >= MAX_TONIGHT_PICKS) break
    const hours = taskEffortHours(task)
    const fit = hours <= remaining + 0.15
    if (fit || picks.length === 0) {
      picks.push({
        task,
        hours,
        fit,
        assumed: task.estimated_hours == null || task.estimated_hours === '',
        reason: pickReason(task, hours, fit),
      })
      remaining -= hours
      if (!fit) break
    }
  }

  return {
    picks,
    availableHours: safeHours,
    leftoverHours: Math.max(remaining, 0),
  }
}

export function ritualItems(task) {
  const formatLabel =
    task.file_format === 'pdf'
      ? 'Sudah jadi PDF'
      : task.file_format === 'github'
        ? 'Link GitHub sudah siap'
        : task.file_format === 'zip'
          ? 'Sudah di-zip'
          : task.file_format === 'docx'
            ? 'File DOCX sudah final'
            : 'File pengumpulan sudah siap'

  return [
    { key: 'format', label: formatLabel },
    { key: 'filename', label: 'Nama file sudah benar (NIM_Nama_tugas)' },
    { key: 'extras', label: 'Syarat dosen (cover, daftar pustaka, dll.) sudah dicek' },
    {
      key: 'uploaded',
      label: `Sudah diunggah / dikumpul ke ${SUBMIT_VIA_LABEL[task.submit_via] || 'tempat kumpul'}`,
    },
  ]
}

export function isRitualDue(task) {
  if (isTaskClosed(task)) return false
  return hoursUntilDeadline(task) <= RITUAL_WINDOW_HOURS
}

export function ritualProgress(task) {
  const items = ritualItems(task)
  const checks = task.ritual_checks && typeof task.ritual_checks === 'object' ? task.ritual_checks : {}
  const done = items.filter((item) => Boolean(checks[item.key])).length
  return { done, total: items.length, complete: done === items.length }
}
