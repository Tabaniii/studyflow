export default function Header({ userEmail, studyTime, onAddClick, onEditStudyTime, onLogout }) {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">StudyFlow</h1>
          <p className="mt-1 text-sm text-indigo-100">{userEmail}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {studyTime && (
            <button
              onClick={onEditStudyTime}
              title="Klik untuk mengubah jam belajar"
              className="rounded-lg border border-indigo-300/50 bg-indigo-500/40 px-3 py-2 text-xs font-medium text-indigo-50 transition hover:bg-indigo-400/50"
            >
              Belajar {studyTime.slice(0, 5)}
            </button>
          )}
          <button
            onClick={onAddClick}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
          >
            + Tambah Tugas
          </button>
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
