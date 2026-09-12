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
    <section className={isMissed ? 'card-insight p-4' : 'card-cta p-4'}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="caption-brutal">{isMissed ? 'Sesi terlewat' : 'Sesi berjalan'}</p>
          <p className="mt-1 text-[clamp(20px,2.4vw,28px)] font-extrabold leading-tight">
            {isMissed ? `Jam belajar ${clock} sudah lewat` : `Sesi belajar ${clock} sedang berjalan`}
          </p>
          <p className="mt-2 font-bold">
            {focusTask
              ? `Fokus sekarang: ${focusTask.title} · ${focusTask.course} · ${formatDeadlineLabel(focusTask)}`
              : 'Tidak ada tugas aktif. Bisa dipakai review materi.'}
          </p>
          {!isMissed && session.minutesLeft != null && (
            <p className="caption-brutal mt-2">Sisa jendela sesi ± {session.minutesLeft} menit.</p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {focusTask && (
            <button type="button" onClick={onFocusTask} className="btn-brutal btn-brutal-ink">
              Fokus tugas ini
            </button>
          )}
          <button type="button" onClick={onDismiss} className="btn-brutal">
            Nanti
          </button>
        </div>
      </div>
    </section>
  )
}
