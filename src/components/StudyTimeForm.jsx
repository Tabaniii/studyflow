import { useEffect, useState } from 'react'
import { formatClock, notificationSupported } from '../utils/studyTime'

export default function StudyTimeForm({
  currentTime,
  currentSleepTime,
  permission,
  onSave,
  onCancel,
  onTestReminder,
  onRequestPermission,
}) {
  const [time, setTime] = useState((currentTime ?? '19:00').slice(0, 5))
  const [sleepTime, setSleepTime] = useState((currentSleepTime ?? '23:00').slice(0, 5))
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testMessage, setTestMessage] = useState(null)

  useEffect(() => {
    setTime((currentTime ?? '19:00').slice(0, 5))
    setSleepTime((currentSleepTime ?? '23:00').slice(0, 5))
  }, [currentTime, currentSleepTime])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    await onSave({ studyTime: time, sleepTime })
    setSaving(false)
  }

  async function handleTest() {
    setTesting(true)
    setTestMessage(null)
    const result = await onTestReminder()
    setTesting(false)
    if (!result?.ok) {
      if (result?.permission === 'denied' || result?.permission === 'unsupported') {
        setTestMessage({
          tone: 'error',
          text:
            result.permission === 'unsupported'
              ? 'Browser ini tidak mendukung notifikasi.'
              : 'Notifikasi diblokir. Izinkan dulu di ikon gembok address bar.',
        })
        return
      }
      setTestMessage({
        tone: 'error',
        text: 'Tes gagal. Izinkan notifikasi, lalu coba lagi.',
      })
      return
    }
    setTestMessage({
      tone: 'ok',
      text: 'Tes terkirim. Cek pojok kanan atas / notification center. Kalau tidak muncul, notifikasi browser-nya yang tertutup.',
    })
  }

  const permissionLabel = {
    granted: 'Notifikasi browser: aktif',
    denied: 'Notifikasi browser: diblokir',
    default: 'Notifikasi browser: belum diizinkan',
    unsupported: 'Notifikasi browser: tidak didukung',
  }[permission || (notificationSupported() ? Notification.permission : 'unsupported')]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-800">Atur Jam Belajar</h2>
        <p className="mt-1 text-xs text-slate-500">
          Jam ini memulai sesi belajar di dashboard (90 menit) dan mengirim pengingat, termasuk kalau
          kamu buka app setelah jamnya lewat.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="studyTimeSetting" className="mb-1 block text-sm font-medium text-slate-700">
              Jam mulai belajar
            </label>
            <input
              id="studyTimeSetting"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="sleepTimeSetting" className="mb-1 block text-sm font-medium text-slate-700">
              Jam tidur
            </label>
            <input
              id="sleepTimeSetting"
              type="time"
              value={sleepTime}
              onChange={(event) => setSleepTime(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-slate-400">
              Dipakai untuk rekomendasi “Malam ini ngerjain apa?”.
            </p>
          </div>

          <p className="text-xs font-medium text-slate-600">{permissionLabel}</p>

          {permission !== 'granted' && permission !== 'unsupported' && (
            <button
              type="button"
              onClick={onRequestPermission}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Izinkan notifikasi
            </button>
          )}

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">Cara ngetes cepat</p>
            <ol className="mt-1 list-decimal space-y-1 pl-4">
              <li>Izinkan notifikasi browser.</li>
              <li>Ketuk <span className="font-medium">Tes pengingat</span> — harus muncul popup OS.</li>
              <li>
                Atau set jam ke 1 menit dari sekarang, simpan, biarkan tab StudyFlow terbuka.
              </li>
              <li>Mau tes “kelewatan”: set jam beberapa menit yang lalu, simpan. Banner kuning harus muncul.</li>
            </ol>
            <p className="mt-2 text-slate-400">
              Pengingat OS hanya jalan selama tab ini terbuka. Banner di dalam app tetap kelihatan.
            </p>
          </div>

          {testMessage && (
            <p
              className={`rounded-lg px-3 py-2 text-xs ${
                testMessage.tone === 'ok'
                  ? 'border border-green-200 bg-green-50 text-green-800'
                  : 'border border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {testMessage.text}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="rounded-lg border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-50"
            >
              {testing ? 'Mengirim tes…' : 'Tes pengingat'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Menyimpan…' : `Simpan ${formatClock(time)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
