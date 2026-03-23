'use client'

import { supabase } from './supabaseClient'
import { getProfileByUserId, getSupabaseUserId } from './supabaseDb'

const AUTH_KEY = 'job_sim_auth'

export type StudentContext = {
  userId?: string
  email: string
  name: string
  institutionCode: string
}

function readStudentFromLocalStorage(): StudentContext | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(AUTH_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    const currentUser = parsed?.currentUser
    if (!currentUser?.email) return null

    const users = parsed?.users || []
    const found = users.find((u: any) => u.email === currentUser.email)
    return {
      email: currentUser.email,
      name: currentUser.name || found?.name || currentUser.email,
      institutionCode: found?.institutionCode || found?.institution_code || '',
    }
  } catch {
    return null
  }
}

/**
 * Supabase가 설정되어 있으면 profiles에서 institution_code를 가져오고,
 * 아니면 기존 localStorage shape(job_sim_auth)에서 가져옵니다.
 */
export async function getStudentContext(): Promise<StudentContext | null> {
  if (typeof window === 'undefined') return null

  // 1) Supabase 우선
  if (supabase) {
    try {
      const userId = await getSupabaseUserId()
      if (!userId) return null
      const { data } = await supabase.auth.getUser()
      const email = data?.user?.email || ''
      const prof = await getProfileByUserId(userId)
      if (prof) {
        return {
          userId,
          email,
          name: prof.name || email,
          institutionCode: prof.institution_code || '',
        }
      }
    } catch {
      // fallthrough -> localStorage
    }
  }

  // 2) 로컬 fallback
  return readStudentFromLocalStorage()
}

