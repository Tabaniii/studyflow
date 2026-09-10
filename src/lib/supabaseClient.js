import { createClient } from '@supabase/supabase-js'

const rawUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

const isPlaceholder = (value) =>
  !value || value.includes('your-project-ref') || value.includes('your-anon')

// User sering tidak sengaja menyalin URL Data API (…/rest/v1) atau
// menyertakan trailing slash — pangkas ke origin agar selalu valid.
function normalizeSupabaseUrl(value) {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

const normalizedUrl = normalizeSupabaseUrl(rawUrl)
const isDashboardUrl =
  normalizedUrl !== null && new URL(normalizedUrl).host === 'supabase.com'

export const isSupabaseConfigured =
  !isPlaceholder(rawUrl) &&
  !isPlaceholder(supabaseAnonKey) &&
  normalizedUrl !== null &&
  !isDashboardUrl

export const supabaseConfigIssue = isSupabaseConfigured
  ? null
  : isPlaceholder(rawUrl)
    ? 'VITE_SUPABASE_URL masih placeholder — ganti dengan Project URL (https://xxxx.supabase.co).'
    : normalizedUrl === null
      ? 'VITE_SUPABASE_URL tidak valid — harus diawali https:// tanpa spasi/kutip.'
      : isDashboardUrl
        ? 'VITE_SUPABASE_URL berisi URL dashboard. Salin "Project URL" dari Project Settings → API, bukan URL halaman dashboard.'
        : 'VITE_SUPABASE_ANON_KEY masih placeholder — ganti dengan anon public key dari Project Settings → API.'

export const supabase = isSupabaseConfigured
  ? createClient(normalizedUrl, supabaseAnonKey)
  : null
