import InstallPrompt from './InstallPrompt'

function studyChipLabel(studyTime, session, permission) {
  const clock = String(studyTime || '').slice(0, 5)
  if (permission === 'denied') return `Belajar ${clock} · notif mati`
  if (session?.phase === 'active') return `Sesi ${clock} berjalan`
  if (session?.phase === 'missed') return `Jam ${clock} lewat`
  if (session?.phase === 'upcoming' && session.minutesUntil != null) {
    const hours = Math.floor(session.minutesUntil / 60)
    const minutes = session.minutesUntil % 60
    const eta = hours > 0 ? `${hours} jam ${minutes} mnt` : `${minutes} mnt`
    return `Belajar ${clock} · ${eta} lagi`
  }
  return `Belajar ${clock}`
}

export default function Header({
  userEmail,
  studyTime,
  session,
  permission,
  onAddClick,
  onEditStudyTime,
  onLogout,
}) {
  const studyTone =
    session?.phase === 'active'
      ? 'btn-brutal-yellow'
      : session?.phase === 'missed' || permission === 'denied'
        ? 'btn-brutal-primary'
        : ''

  return (
    <header className="bg-brutal-grid">
      <div className="page-shell flex flex-wrap items-center justify-between gap-4 py-6">
        <div>
          <p className="brutal-scribble mb-2" aria-hidden="true" />
          <h1 className="font-display heading-underline text-[clamp(32px,5vw,48px)] text-ink">
            StudyFlow
          </h1>
          <p className="mt-2 text-ink">
            {userEmail} · konteks tugas, bukan sekadar deadline
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {studyTime && (
            <button
              onClick={onEditStudyTime}
              title="Atur jam belajar dan tes pengingat"
              className={`btn-brutal btn-brutal-sm ${studyTone}`}
            >
              {studyChipLabel(studyTime, session, permission)}
            </button>
          )}
          <button onClick={onAddClick} className="btn-brutal btn-brutal-primary">
            + Tambah Tugas
          </button>
          <InstallPrompt />
          <button onClick={onLogout} className="btn-brutal btn-brutal-sm">
            Keluar
          </button>
        </div>
      </div>
    </header>
  )
}
