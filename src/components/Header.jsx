import InstallPrompt from './InstallPrompt'

function studyChipLabel(studyTime, session, permission, compact) {
  const clock = String(studyTime || '').slice(0, 5)
  if (permission === 'denied') return compact ? `${clock} · notif mati` : `Belajar ${clock} · notif mati`
  if (session?.phase === 'active') return compact ? `Sesi ${clock}` : `Sesi ${clock} berjalan`
  if (session?.phase === 'missed') return compact ? `${clock} lewat` : `Jam ${clock} lewat`
  if (session?.phase === 'upcoming' && session.minutesUntil != null) {
    const hours = Math.floor(session.minutesUntil / 60)
    const minutes = session.minutesUntil % 60
    if (compact) {
      return hours > 0 ? `${clock} · ${hours}j ${minutes}m` : `${clock} · ${minutes}m`
    }
    const eta = hours > 0 ? `${hours} jam ${minutes} mnt` : `${minutes} mnt`
    return `Belajar ${clock} · ${eta} lagi`
  }
  return compact ? clock : `Belajar ${clock}`
}

export default function Header({
  userName,
  userEmail,
  studyTime,
  session,
  permission,
  onAddClick,
  onEditStudyTime,
  onLogout,
  onDeleteAccount,
}) {
  const studyTone =
    session?.phase === 'active'
      ? 'btn-brutal-yellow'
      : session?.phase === 'missed' || permission === 'denied'
        ? 'btn-brutal-primary'
        : ''

  return (
    <header className="bg-brutal-grid pt-[env(safe-area-inset-top,0px)]">
      <div className="page-shell flex flex-col gap-3 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:py-6">
        <div className="min-w-0">
          <p className="brutal-scribble mb-2 hidden sm:block" aria-hidden="true" />
          <h1 className="font-display heading-underline text-[clamp(28px,5vw,48px)] text-ink">
            StudyFlow
          </h1>
          <p className="mt-1 truncate text-ink sm:mt-2">
            {userName || userEmail}
            <span className="hidden sm:inline"> · konteks tugas, bukan sekadar deadline</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {studyTime && (
            <button
              onClick={onEditStudyTime}
              title="Atur jam belajar dan tes pengingat"
              className={`btn-brutal btn-brutal-sm ${studyTone}`}
            >
              <span className="sm:hidden">{studyChipLabel(studyTime, session, permission, true)}</span>
              <span className="hidden sm:inline">{studyChipLabel(studyTime, session, permission)}</span>
            </button>
          )}
          <button onClick={onAddClick} className="btn-brutal btn-brutal-primary btn-brutal-sm sm:px-4 sm:py-2 sm:text-base">
            + Tambah
            <span className="hidden sm:inline"> Tugas</span>
          </button>
          <InstallPrompt />
          <button onClick={onLogout} className="btn-brutal btn-brutal-sm">
            Keluar
          </button>
          <button
            type="button"
            onClick={onDeleteAccount}
            className="btn-brutal btn-brutal-sm btn-brutal-primary"
          >
            Hapus
            <span className="hidden sm:inline"> akun</span>
          </button>
        </div>
      </div>
    </header>
  )
}
