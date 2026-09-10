import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuthForm() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', studyTime: '19:00' })
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const isRegister = mode === 'register'

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

    if (isRegister) {
      if (form.password.length < 6) {
        setError('Password minimal 6 karakter')
        setLoading(false)
        return
      }
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { study_time: form.studyTime } },
      })

      if (signUpError) {
        setError(translateAuthError(signUpError.message))
      } else {
        setInfo('Pendaftaran berhasil! Cek email kamu untuk konfirmasi, lalu masuk.')
        setMode('login')
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-700 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-800">StudyFlow</h1>
        <p className="mt-1 text-sm text-slate-500">
          Semua tugas kuliahmu, terpantau dalam satu dashboard.
        </p>

        <div className="mt-6 grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`rounded-md py-1.5 text-sm font-medium transition ${
              !isRegister ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`rounded-md py-1.5 text-sm font-medium transition ${
              isRegister ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Daftar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder={isRegister ? 'Minimal 6 karakter' : 'Password kamu'}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="studyTime" className="mb-1 block text-sm font-medium text-slate-700">
                Jam Belajar
              </label>
              <input
                id="studyTime"
                name="studyTime"
                type="time"
                required
                value={form.studyTime}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-slate-400">
                Kamu akan dapat notifikasi pengingat belajar setiap hari di jam ini.
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Memproses…' : isRegister ? 'Daftar Sekarang' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}

function translateAuthError(message) {
  if (message.includes('Invalid login credentials')) return 'Email atau password salah'
  if (message.includes('User already registered')) return 'Email sudah terdaftar, silakan masuk'
  if (message.includes('Email not confirmed'))
    return 'Email belum dikonfirmasi. Cek inbox email kamu'
  if (message.includes('Unable to validate email')) return 'Format email tidak valid'
  return message
}
