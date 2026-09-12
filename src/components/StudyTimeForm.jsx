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
    <div className="overlay-brutal">
      <div className="card-brutal card-brutal-lg flex max-h-[calc(100dvh-24px)] w-full max-w-md flex-col overflow-hidden">
        <div className="shrink-0 px-4 pt-4 sm:px-6 sm:pt-6">
          <h2 className="font-display text-[clamp(24px,3vw,32px)]">Atur Jam Belajar</h2>
          <p className="mt-2 font-bold">
            Jam ini memulai sesi 90 menit dan mengirim pengingat, termasuk kalau app dibuka setelah jamnya lewat.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
            <div>
              <label htmlFor="studyTimeSetting" className="caption-brutal mb-2 block">
                Jam mulai belajar
              </label>
              <input
                id="studyTimeSetting"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                required
                className="input-brutal"
              />
            </div>
            <div>
              <label htmlFor="sleepTimeSetting" className="caption-brutal mb-2 block">
                Jam tidur
              </label>
              <input
                id="sleepTimeSetting"
                type="time"
                value={sleepTime}
                onChange={(event) => setSleepTime(event.target.value)}
                required
                className="input-brutal"
              />
              <p className="mt-2 font-medium">
                Dipakai untuk rekomendasi “Malam ini ngerjain apa?”.
              </p>
            </div>

            <p className="caption-brutal">{permissionLabel}</p>

            {permission !== 'granted' && permission !== 'unsupported' && (
              <button type="button" onClick={onRequestPermission} className="btn-brutal btn-brutal-sm">
                Izinkan notifikasi
              </button>
            )}

            <details className="brutal-border brutal-radius-md bg-brutal-yellow p-3">
              <summary className="caption-brutal cursor-pointer">Cara ngetes cepat</summary>
              <ol className="mt-2 list-decimal space-y-1 pl-4 font-bold">
                <li>Izinkan notifikasi browser.</li>
                <li>Ketuk Tes pengingat — harus muncul popup OS.</li>
                <li>
                  Atau set jam ke 1 menit dari sekarang, simpan, biarkan tab StudyFlow terbuka.
                </li>
                <li>Mau tes kelewatan: set jam beberapa menit yang lalu, simpan. Banner kuning harus muncul.</li>
              </ol>
              <p className="mt-2 font-medium">
                Pengingat OS hanya jalan selama tab ini terbuka. Banner di dalam app tetap kelihatan.
              </p>
            </details>

            {testMessage && (
              <p
                className={`brutal-border brutal-radius-sm px-3 py-2 font-bold ${
                  testMessage.tone === 'ok' ? 'bg-brutal-green' : 'bg-brutal-orange'
                }`}
              >
                {testMessage.text}
              </p>
            )}
          </div>

          <div className="divider-brutal-top grid shrink-0 grid-cols-1 gap-2 bg-surface p-4 sm:flex sm:flex-wrap sm:justify-end">
            <button type="button" onClick={onCancel} className="btn-brutal w-full sm:w-auto">
              Batal
            </button>
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="btn-brutal btn-brutal-yellow w-full sm:w-auto"
            >
              {testing ? 'Mengirim tes…' : 'Tes pengingat'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-brutal btn-brutal-primary w-full sm:w-auto"
            >
              {saving ? 'Menyimpan…' : `Simpan ${formatClock(time)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
