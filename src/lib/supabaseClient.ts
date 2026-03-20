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

// Vercel 환경변수 반영 여부를 빠르게 확인하기 위한 디버그 로그
// (민감정보는 제외하고 "설정 여부/길이"만 출력)
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] configured=',
    canCreate,
    'url=',
    !!SUPABASE_URL,
    'anonKeyLen=',
    (SUPABASE_ANON_KEY || '').length,
  )
}

