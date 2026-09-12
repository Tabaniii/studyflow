import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import PasswordField from './PasswordField'
import { translateAuthError } from '../utils/auth'

export default function ResetPasswordForm({ onDone }) {
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Konfirmasi password tidak sama')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password: form.password })
    setLoading(false)

    if (updateError) {
      setError(translateAuthError(updateError.message))
      return
    }

    window.history.replaceState({}, document.title, window.location.pathname)
    onDone()
  }

  return (
    <div className="bg-brutal-grid flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="card-brutal card-brutal-lg w-full max-w-md p-5 sm:p-8">
        <p className="brutal-scribble mb-3" aria-hidden="true" />
        <h1 className="font-display heading-underline text-[clamp(32px,8vw,48px)]">Password baru</h1>
        <p className="mt-4 font-bold">
          Link reset valid. Isi password baru, lalu kamu langsung masuk ke dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <PasswordField
            id="new-password"
            name="password"
            label="Password baru"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimal 6 karakter"
            autoComplete="new-password"
          />
          <PasswordField
            id="confirm-new-password"
            name="confirmPassword"
            label="Konfirmasi password baru"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Ulangi password baru"
            autoComplete="new-password"
          />

          {error && (
            <p className="brutal-border brutal-radius-sm bg-brutal-orange px-3 py-2 font-bold">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-brutal btn-brutal-primary w-full">
            {loading ? 'Menyimpan…' : 'Simpan password'}
          </button>
        </form>
      </div>
    </div>
  )
}
