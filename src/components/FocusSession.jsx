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
    <div className="overlay-brutal">
      <div className="card-insight insight-brutal w-full max-w-lg p-6">
        <p className="caption-brutal">Sesi fokus</p>
        <h2 className="font-display mt-2 text-[clamp(28px,4vw,40px)]">{task.title}</h2>
        <p className="mt-2 font-bold">{task.course}</p>
        {task.description && <p className="mt-3">{task.description}</p>}
        <AttachmentThumbs attachments={task.attachments} />

        <p className="font-display mt-8 text-center text-[clamp(40px,10vw,80px)] leading-none">
          {formatTimer(remaining)}
        </p>
        <p className="mt-3 text-center font-bold">
          {done
            ? 'Waktu sesi habis. Istirahat sebentar atau lanjut.'
            : `Fokus ke satu tugas ini · ${formatDuration(durationSec / 3600)}`}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => onAddTime(5 * 60)} className="btn-brutal">
            +5 menit
          </button>
          <button type="button" onClick={onMarkDikerjakan} className="btn-brutal btn-brutal-ink">
            Tandai dikerjakan
          </button>
          <button type="button" onClick={onClose} className="btn-brutal">
            Selesai sesi
          </button>
        </div>
      </div>
    </div>
  )
}
