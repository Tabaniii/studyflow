export function authRedirectUrl() {
  return `${window.location.origin}/`
}

export function normalizeDisplayName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

export function validateDisplayName(value) {
  const name = normalizeDisplayName(value)
  if (name.length < 2) return 'Nama minimal 2 karakter'
  if (name.length > 32) return 'Nama maksimal 32 karakter'
  if (name.includes('@')) return 'Nama tidak boleh berisi @. Login pakai nama, email di kolom email.'
  if (!/^[\p{L}\p{N} ._'-]+$/u.test(name)) return 'Nama hanya boleh huruf, angka, spasi, titik, _ atau -'
  return null
}

export function translateAuthError(message) {
  if (message.includes('Invalid login credentials')) return 'Email atau password salah'
  if (message.includes('User already registered')) return 'Email sudah terdaftar, silakan masuk'
  if (message.includes('Email not confirmed'))
    return 'Email belum dikonfirmasi. Cek inbox email kamu'
  if (message.includes('Unable to validate email')) return 'Format email tidak valid'
  if (message.includes('For security purposes'))
    return 'Tunggu sebentar sebelum meminta link reset lagi'
  if (message.includes('New password should be different'))
    return 'Password baru harus berbeda dari yang lama'
  if (message.includes('Password should be at least')) return 'Password minimal 6 karakter'
  if (message.includes('Nama sudah dipakai') || message.includes('duplicate key'))
    return 'Nama itu sudah dipakai, pilih nama lain'
  if (
    message.includes('Error sending recovery email') ||
    message.includes('Error sending confirmation email') ||
    message.includes('Error sending')
  ) {
    return 'Email gagal dikirim. Cek SMTP di Supabase: Username harus alamat Gmail lengkap, Password harus App Password Gmail (bukan password login biasa). Template HTML bukan penyebabnya.'
  }
  return message
}
