import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import PasswordField from './PasswordField'
import { authRedirectUrl, translateAuthError } from '../utils/auth'

export default function AuthForm() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const isRegister = mode === 'register'
  const isForgot = mode === 'forgot'

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setError(null)
    setInfo(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    if (isForgot) {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: authRedirectUrl(),
      })
      if (resetError) {
        setError(translateAuthError(resetError.message))
      } else {
        setInfo('Kalau email itu terdaftar, link reset sudah dikirim. Cek inbox dan folder spam.')
      }
      setLoading(false)
      return
    }

    if (isRegister) {
      if (form.password.length < 6) {
        setError('Password minimal 6 karakter')
        setLoading(false)
        return
      }
      if (form.password !== form.confirmPassword) {
        setError('Konfirmasi password tidak sama')
        setLoading(false)
        return
      }
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { emailRedirectTo: authRedirectUrl() },
      })

      if (signUpError) {
        setError(translateAuthError(signUpError.message))
      } else {
        setInfo('Pendaftaran berhasil! Cek email kamu untuk konfirmasi, lalu masuk.')
        setMode('login')
        setForm((prev) => ({ ...prev, confirmPassword: '' }))
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (signInError) {
        setError(translateAuthError(signInError.message))
      }
    }
    setLoading(false)
  }

  return (
    <div className="bg-brutal-grid flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="card-brutal card-brutal-lg relative w-full max-w-md p-5 sm:p-8">
        <p className="brutal-scribble mb-3" aria-hidden="true" />
        <h1 className="font-display heading-underline text-[clamp(32px,8vw,48px)]">StudyFlow</h1>
        <p className="mt-4 text-ink">
          {isForgot
            ? 'Masukkan email akun kamu. Kami kirim link untuk ganti password.'
            : 'Catat deadline lengkap dengan konteks: diumumkan di mana, kumpul ke mana, syaratnya apa.'}
        </p>

        {!isForgot && (
          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`btn-brutal btn-brutal-sm ${!isRegister ? 'btn-brutal-ink' : ''}`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`btn-brutal btn-brutal-sm ${isRegister ? 'btn-brutal-ink' : ''}`}
            >
              Daftar
            </button>
          </div>
        )}

        {isForgot && (
          <p className="caption-brutal mt-6">Reset password</p>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="caption-brutal mb-2 block">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              className="input-brutal"
            />
          </div>

          {!isForgot && (
            <PasswordField
              id="password"
              name="password"
              label="Password"
              value={form.password}
              onChange={handleChange}
              placeholder={isRegister ? 'Minimal 6 karakter' : 'Password kamu'}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          )}

          {isRegister && (
            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="Konfirmasi password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Ulangi password"
              autoComplete="new-password"
            />
          )}

          {error && (
            <p className="brutal-border brutal-radius-sm bg-brutal-orange px-3 py-2 font-bold text-ink">
              {error}
            </p>
          )}
          {info && (
            <p className="brutal-border brutal-radius-sm bg-brutal-green px-3 py-2 font-bold text-ink">
              {info}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-brutal btn-brutal-primary w-full">
            {loading
              ? 'Memproses…'
              : isForgot
                ? 'Kirim link reset'
                : isRegister
                  ? 'Daftar Sekarang'
                  : 'Masuk'}
          </button>
        </form>

        {!isRegister && !isForgot && (
          <button
            type="button"
            onClick={() => switchMode('forgot')}
            className="caption-brutal heading-underline mt-4"
          >
            Lupa password?
          </button>
        )}

        {isForgot && (
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="caption-brutal heading-underline mt-4"
          >
            Kembali masuk
          </button>
        )}
      </div>
    </div>
  )
}
