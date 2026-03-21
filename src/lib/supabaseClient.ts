import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function isConfiguredUrl(url: unknown) {
  return typeof url === 'string' && url.startsWith('http')
}

function isConfiguredKey(key: unknown) {
  return typeof key === 'string' && key.length > 20 && key !== 'undefined' && key !== ''
}

const canCreate =
  isConfiguredUrl(SUPABASE_URL) &&
  isConfiguredKey(SUPABASE_ANON_KEY)

// Supabase 설정이 비정상/미설정이면 null로 반환해서 기존 localStorage 흐름 유지
export const supabase = canCreate
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null

export const supabaseConfigured = canCreate

/** localhost가 아닌 배포( Vercel / 커스텀 도메인 )에서 Supabase 미설정 시 안내용 */
export function isLikelyDeployedHostname(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h !== 'localhost' && !h.startsWith('127.')
}

