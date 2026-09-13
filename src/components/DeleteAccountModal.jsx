import { useState } from 'react'

export default function DeleteAccountModal({ userEmail, onConfirm, onCancel }) {
  const [typed, setTyped] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const canDelete = typed.trim().toUpperCase() === 'HAPUS'

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canDelete) {
      setError('Ketik HAPUS untuk konfirmasi')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onConfirm()
    } catch (confirmError) {
      setError(confirmError.message || 'Gagal menghapus akun')
      setSaving(false)
    }
  }

  return (
    <div className="overlay-brutal">
      <div className="card-brutal card-brutal-lg flex max-h-[calc(100dvh-24px)] w-full max-w-md flex-col overflow-hidden">
        <div className="shrink-0 px-4 pt-4 sm:px-6 sm:pt-6">
          <p className="caption-brutal">Tidak bisa dibatalkan</p>
          <h2 className="font-display mt-1 text-[clamp(24px,3vw,32px)]">Hapus akun</h2>
          <p className="mt-3 font-bold">
            Semua data {userEmail} hilang permanen: tugas, lampiran gambar/PDF, jam belajar, dan akun login.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
            <ul className="brutal-border brutal-radius-md bg-brutal-orange p-3 font-bold">
              <li>Tugas dan status</li>
              <li>Screenshot, foto, PDF lampiran</li>
              <li>Profil dan jam belajar</li>
              <li>Sesi login</li>
            </ul>

            <div>
              <label htmlFor="confirmDelete" className="caption-brutal mb-2 block">
                Ketik HAPUS untuk konfirmasi
              </label>
              <input
                id="confirmDelete"
                name="confirmDelete"
                type="text"
                autoComplete="off"
                value={typed}
                onChange={(event) => {
                  setTyped(event.target.value)
                  setError(null)
                }}
                placeholder="HAPUS"
                className="input-brutal"
              />
            </div>

            {error && (
              <p className="brutal-border brutal-radius-sm bg-brutal-orange px-3 py-2 font-bold">
                {error}
              </p>
            )}
          </div>

          <div className="divider-brutal-top grid shrink-0 grid-cols-1 gap-2 bg-surface p-4 sm:flex sm:flex-wrap sm:justify-end">
            <button type="button" onClick={onCancel} className="btn-brutal w-full sm:w-auto">
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || !canDelete}
              className="btn-brutal btn-brutal-primary w-full sm:w-auto"
            >
              {saving ? 'Menghapus…' : 'Hapus akun selamanya'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
