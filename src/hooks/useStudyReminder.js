import { useEffect } from 'react'

const CHECK_INTERVAL_MS = 30 * 1000
const LAST_REMINDER_KEY = 'studyflow:last-reminder'

export function useStudyReminder(studyTime, stats) {
  useEffect(() => {
    if (!studyTime || !('Notification' in window)) return

    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const check = () => {
      if (Notification.permission !== 'granted') return

      const now = new Date()
      const [hour, minute] = studyTime.split(':').map(Number)
      if (now.getHours() !== hour || now.getMinutes() !== minute) return

      // cegah notifikasi berulang di hari yang sama
      const todayKey = now.toISOString().slice(0, 10)
      if (localStorage.getItem(LAST_REMINDER_KEY) === todayKey) return
      localStorage.setItem(LAST_REMINDER_KEY, todayKey)

      const body =
        stats.aktif > 0
          ? [
              `Kamu punya ${stats.aktif} tugas aktif.`,
              stats.mendekati > 0 ? `${stats.mendekati} mendekati deadline.` : '',
              stats.terlambat > 0 ? `${stats.terlambat} sudah terlambat!` : '',
            ]
              .filter(Boolean)
              .join(' ')
          : 'Semua tugas sudah beres. Bisa dipakai review materi!'

      new Notification('StudyFlow — Waktunya belajar!', { body })
    }

    const interval = setInterval(check, CHECK_INTERVAL_MS)
    check()
    return () => clearInterval(interval)
  }, [studyTime, stats.aktif, stats.mendekati, stats.terlambat])
}
