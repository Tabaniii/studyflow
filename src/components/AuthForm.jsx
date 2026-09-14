import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import PasswordField from './PasswordField'
import {
  authRedirectUrl,
  normalizeDisplayName,
  translateAuthError,
  validateDisplayName,
} from '../utils/auth'

export default function AuthForm() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    identifier: '',
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  })
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

  async function resolveEmail(identifier) {
    const trimmed = identifier.trim()
    if (!trimmed) return null
    if (trimmed.includes('@')) return trimmed

    const { data, error: lookupError } = await supabase.rpc('email_for_login', {
      identifier: trimmed,
    })
    if (lookupError) {
      if (lookupError.message?.includes('Could not find the function')) {
        throw new Error('Jalankan supabase/schema.sql terbaru di SQL Editor dulu (fungsi login nama belum ada).')
      }
      throw lookupError
    }
    return data
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
      const name = normalizeDisplayName(form.name)
      const nameError = validateDisplayName(name)
      if (nameError) {
        setError(nameError)
        setLoading(false)
        return
      }
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
        options: {
          emailRedirectTo: authRedirectUrl(),
          data: { name },
        },
      })

      if (signUpError) {
        setError(translateAuthError(signUpError.message))
      } else {
        setInfo('Pendaftaran berhasil! Cek email kamu untuk konfirmasi, lalu masuk pakai nama atau email.')
        setMode('login')
        setForm((prev) => ({ ...prev, identifier: name, confirmPassword: '' }))
      }
      setLoading(false)
      return
    }

    try {
      const email = await resolveEmail(form.identifier)
      if (!email) {
        setError('Nama atau email tidak ditemukan')
        setLoading(false)
        return
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: form.password,
      })
      if (signInError) setError(translateAuthError(signInError.message))
    } catch (loginError) {
      setError(translateAuthError(loginError.message || String(loginError)))
    }
    setLoading(false)
  }

  return (
    <div className="bg-brutal-grid flex min-h-dvh items-center justify-center p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:p-6">
      <div className="card-brutal card-brutal-lg relative w-full max-w-md p-5 sm:p-8">
        <p className="brutal-scribble mb-3" aria-hidden="true" />
        <h1 className="font-display heading-underline text-[clamp(32px,8vw,48px)]">StudyFlow</h1>
        <p className="mt-4 text-ink">
          {isForgot
            ? 'Masukkan email akun kamu. Kami kirim link untuk ganti password.'
            : isRegister
              ? 'Isi nama unik, email, dan password. Nanti bisa masuk pakai nama atau email.'
              : 'Masuk pakai nama atau email, plus password.'}
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
          {isRegister && (
            <div>
              <label htmlFor="name" className="caption-brutal mb-2 block">
                Nama
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="nickname"
                value={form.name}
                onChange={handleChange}
                placeholder="cth: Budi"
                className="input-brutal"
              />
            </div>
          )}

          {isForgot || isRegister ? (
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
          ) : (
            <div>
              <label htmlFor="identifier" className="caption-brutal mb-2 block">
                Nama atau email
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                autoComplete="username"
                value={form.identifier}
                onChange={handleChange}
                placeholder="Budi atau nama@email.com"
                className="input-brutal"
              />
            </div>
          )}

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
