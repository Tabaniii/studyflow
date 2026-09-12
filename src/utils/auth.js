export function authRedirectUrl() {
  return `${window.location.origin}/`
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
  return message
}
