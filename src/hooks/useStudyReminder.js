import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatDuration, hoursUntilDeadline, isEmergency, isTaskClosed } from '../utils/taskUtils'
import {
  LAST_STUDY_KEY,
  LAST_URGENCY_KEY,
  getStudySessionState,
  notificationSupported,
  todayKey,
} from '../utils/studyTime'

const CHECK_INTERVAL_MS = 15 * 1000

function activeTasks(tasks) {
  return (tasks || []).filter((task) => !isTaskClosed(task))
}

export function pickFocusTask(tasks) {
  const open = activeTasks(tasks)
  if (open.length === 0) return null
  return [...open].sort((a, b) => {
    const aEmer = isEmergency(a) ? 0 : 1
    const bEmer = isEmergency(b) ? 0 : 1
    if (aEmer !== bEmer) return aEmer - bEmer
    return hoursUntilDeadline(a) - hoursUntilDeadline(b)
  })[0]
}

function summarizeTasks(list, limit = 3) {
  return list
    .slice(0, limit)
    .map((task) => {
      const hours = hoursUntilDeadline(task)
      const when = hours < 0 ? `terlambat ${formatDuration(hours)}` : `${formatDuration(hours)} lagi`
      return `${task.title} (${when})`
    })
    .join(', ')
}

function buildStudyBody(stats, tasks) {
  const open = activeTasks(tasks)
  const emergency = open.filter(isEmergency)
  if (stats.aktif > 0) {
    return [
      `Kamu punya ${stats.aktif} tugas aktif.`,
      stats.darurat > 0 ? `${stats.darurat} darurat 48 jam.` : '',
      stats.mendekati > 0 ? `${stats.mendekati} mendekati deadline.` : '',
      stats.terlambat > 0 ? `${stats.terlambat} sudah terlambat!` : '',
      summarizeTasks(emergency.length > 0 ? emergency : open),
    ]
      .filter(Boolean)
      .join(' ')
  }
  return 'Semua tugas sudah beres. Bisa dipakai review materi!'
}

function notify(title, body) {
  if (!notificationSupported()) return false
  if (Notification.permission !== 'granted') return false
  new Notification(title, { body })
  return true
}

export function useStudyReminder(studyTime, stats, tasks = []) {
  const [permission, setPermission] = useState(() =>
    notificationSupported() ? Notification.permission : 'unsupported',
  )
  const [tick, setTick] = useState(0)

  const session = useMemo(
    () => getStudySessionState(studyTime, new Date()),
    [studyTime, tick],
  )

  const focusTask = useMemo(() => pickFocusTask(tasks), [tasks, tick])

  const refreshPermission = useCallback(() => {
    if (!notificationSupported()) {
      setPermission('unsupported')
      return 'unsupported'
    }
    setPermission(Notification.permission)
    return Notification.permission
  }, [])

  const requestPermission = useCallback(async () => {
    if (!notificationSupported()) return 'unsupported'
    if (Notification.permission === 'granted') {
      setPermission('granted')
      return 'granted'
    }
    const next = await Notification.requestPermission()
    setPermission(next)
    return next
  }, [])

  const sendTest = useCallback(async () => {
    const next = await requestPermission()
    if (next !== 'granted') {
      return { ok: false, permission: next }
    }
    const ok = notify('StudyFlow — Tes pengingat berhasil', buildStudyBody(stats, tasks))
    return { ok, permission: next }
  }, [requestPermission, stats, tasks])

  useEffect(() => {
    if (!notificationSupported()) return undefined

    if (Notification.permission === 'default') {
      Notification.requestPermission().then((next) => setPermission(next))
    } else {
      setPermission(Notification.permission)
    }

    const check = () => {
      setTick((value) => value + 1)
      if (Notification.permission !== 'granted') return

      const now = new Date()
      const today = todayKey(now)
      const open = activeTasks(tasks)
      const emergency = open.filter(isEmergency)
      const overdue = open.filter((task) => hoursUntilDeadline(task) < 0)
      const notStarted = open.filter((task) => (task.status || 'belum_mulai') === 'belum_mulai')

      if (localStorage.getItem(LAST_URGENCY_KEY) !== today) {
        if (emergency.length > 0 || overdue.length > 0) {
          notify('StudyFlow — Ada tugas yang harus segera dikerjakan', [
            overdue.length > 0 ? `${overdue.length} terlambat.` : '',
            emergency.length > 0 ? `${emergency.length} darurat 48 jam.` : '',
            notStarted.length > 0 ? `${notStarted.length} belum mulai.` : '',
            summarizeTasks(overdue.length > 0 ? overdue : emergency),
          ]
            .filter(Boolean)
            .join(' '))
          localStorage.setItem(LAST_URGENCY_KEY, today)
        }
      }

      if (!studyTime) return
      const phase = getStudySessionState(studyTime, now).phase
      if (phase !== 'active' && phase !== 'missed') return
      if (localStorage.getItem(LAST_STUDY_KEY) === today) return

      const title =
        phase === 'missed'
          ? 'StudyFlow — Jam belajar sudah lewat'
          : 'StudyFlow — Waktunya belajar!'
      notify(title, buildStudyBody(stats, tasks))
      localStorage.setItem(LAST_STUDY_KEY, today)
    }

    const interval = setInterval(check, CHECK_INTERVAL_MS)
    check()
    return () => clearInterval(interval)
  }, [studyTime, tasks, stats.aktif, stats.darurat, stats.mendekati, stats.terlambat])

  return {
    permission,
    session,
    focusTask,
    sendTest,
    requestPermission,
    refreshPermission,
  }
}
