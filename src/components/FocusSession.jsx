import { useEffect, useState } from 'react'
import { formatDuration } from '../utils/taskUtils'
import AttachmentThumbs from './AttachmentThumbs'

function formatTimer(totalSeconds) {
  const safe = Math.max(0, totalSeconds)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function FocusSession({
  task,
  durationSec,
  startedAt,
  onAddTime,
  onMarkDikerjakan,
  onClose,
}) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(timer)
  }, [])

  const elapsed = Math.floor((now - startedAt) / 1000)
  const remaining = durationSec - elapsed
  const done = remaining <= 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Sesi fokus</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">{task.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{task.course}</p>
        {task.description && <p className="mt-3 text-sm text-slate-600">{task.description}</p>}
        <AttachmentThumbs attachments={task.attachments} />

        <p className={`mt-6 text-center font-mono text-6xl font-bold ${done ? 'text-amber-600' : 'text-slate-900'}`}>
          {formatTimer(remaining)}
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          {done
            ? 'Waktu sesi habis. Istirahat sebentar atau lanjut.'
            : `Fokus ke satu tugas ini · ${formatDuration(durationSec / 3600)}`}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => onAddTime(5 * 60)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            +5 menit
          </button>
          <button
            type="button"
            onClick={onMarkDikerjakan}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Tandai dikerjakan
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Selesai sesi
          </button>
        </div>
      </div>
    </div>
  )
}
