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
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">StudyFlow</h1>
          <p className="mt-1 text-sm text-indigo-100">
            {userEmail} · konteks tugas, bukan sekadar deadline
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {studyTime && (
            <button
              onClick={onEditStudyTime}
              title="Atur jam belajar dan tes pengingat"
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                session?.phase === 'active'
                  ? 'border-white/70 bg-white text-indigo-700'
                  : session?.phase === 'missed' || permission === 'denied'
                    ? 'border-amber-200/70 bg-amber-400/30 text-amber-50 hover:bg-amber-400/40'
                    : 'border-indigo-300/50 bg-indigo-500/40 text-indigo-50 hover:bg-indigo-400/50'
              }`}
            >
              {studyChipLabel(studyTime, session, permission)}
            </button>
          )}
          <button
            onClick={onAddClick}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
          >
            + Tambah Tugas
          </button>
          <InstallPrompt />
          <button
            onClick={onLogout}
            className="rounded-lg border border-indigo-300/50 px-3 py-2 text-xs font-medium text-indigo-100 transition hover:bg-indigo-500/40"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>
  )
}
