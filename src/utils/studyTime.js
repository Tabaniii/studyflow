export const STUDY_WINDOW_MINUTES = 90
export const LAST_STUDY_KEY = 'studyflow:last-reminder'
export const LAST_URGENCY_KEY = 'studyflow:last-urgency-digest'
export const SESSION_DISMISS_KEY = 'studyflow:session-dismissed'

export function todayKey(date = new Date()) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function formatClock(studyTime) {
  if (!studyTime) return '—'
  return String(studyTime).slice(0, 5).replace(':', '.')
}

export function parseStudyMinutes(studyTime) {
  if (!studyTime) return null
  const [hour, minute] = String(studyTime).slice(0, 5).split(':').map(Number)
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null
  return hour * 60 + minute
}

export function getStudySessionState(studyTime, now = new Date(), windowMinutes = STUDY_WINDOW_MINUTES) {
  const start = parseStudyMinutes(studyTime)
  if (start == null) {
    return { phase: 'none', startMinutes: null, minutesUntil: null, minutesLeft: null }
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  if (nowMinutes < start) {
    return {
      phase: 'upcoming',
      startMinutes: start,
      minutesUntil: start - nowMinutes,
      minutesLeft: null,
    }
  }
  if (nowMinutes < start + windowMinutes) {
    return {
      phase: 'active',
      startMinutes: start,
      minutesUntil: 0,
      minutesLeft: start + windowMinutes - nowMinutes,
    }
  }
  return {
    phase: 'missed',
    startMinutes: start,
    minutesUntil: null,
    minutesLeft: 0,
  }
}

export function isSessionDismissedToday() {
  return localStorage.getItem(SESSION_DISMISS_KEY) === todayKey()
}

export function dismissStudySession() {
  localStorage.setItem(SESSION_DISMISS_KEY, todayKey())
}

export function rearmStudyReminder() {
  localStorage.removeItem(LAST_STUDY_KEY)
  localStorage.removeItem(SESSION_DISMISS_KEY)
}

export function notificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}
