import { formatClock } from '../utils/studyTime'
import { formatDeadlineLabel } from '../utils/taskUtils'

export default function StudySessionBanner({
  session,
  studyTime,
  focusTask,
  dismissed,
  onFocusTask,
  onDismiss,
}) {
  if (!session || session.phase === 'none' || session.phase === 'upcoming' || dismissed) {
    return null
  }

  const clock = formatClock(studyTime)
  const isMissed = session.phase === 'missed'

  return (
    <section
      className={`rounded-xl border px-4 py-3 ${
        isMissed
          ? 'border-amber-200 bg-amber-50 text-amber-950'
          : 'border-indigo-200 bg-indigo-50 text-indigo-950'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold">
            {isMissed ? `Jam belajar ${clock} sudah lewat` : `Sesi belajar ${clock} sedang berjalan`}
          </p>
          <p className="mt-1 text-sm opacity-80">
            {focusTask
              ? `Fokus sekarang: ${focusTask.title} · ${focusTask.course} · ${formatDeadlineLabel(focusTask)}`
              : 'Tidak ada tugas aktif. Bisa dipakai review materi.'}
          </p>
          {!isMissed && session.minutesLeft != null && (
            <p className="mt-1 text-xs opacity-70">Sisa jendela sesi ± {session.minutesLeft} menit.</p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {focusTask && (
            <button
              type="button"
              onClick={onFocusTask}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Fokus tugas ini
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg border border-current/20 px-3 py-1.5 text-sm font-medium opacity-80 transition hover:bg-white/60"
          >
            Nanti
          </button>
        </div>
      </div>
    </section>
  )
}
