import { useState } from 'react'

export default function StudyTimeForm({ currentTime, onSave, onCancel }) {
  const [time, setTime] = useState((currentTime ?? '19:00').slice(0, 5))
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    await onSave(time)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-800">Atur Jam Belajar</h2>
        <p className="mt-1 text-xs text-slate-500">
          Notifikasi pengingat akan muncul setiap hari di jam ini.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
