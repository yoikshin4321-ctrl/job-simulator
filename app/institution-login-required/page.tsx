'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../src/lib/supabaseClient'
import { getProfileByUserId } from '../../src/lib/supabaseDb'

const AUTH_KEY = 'job_sim_auth'

export default function InstitutionLoginRequiredPage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const run = async () => {
      try {
        const raw = window.localStorage.getItem(AUTH_KEY)
        const parsed = raw ? JSON.parse(raw) : null
        const inst = parsed?.currentInstitution
        // currentInstitution 객체가 있으면(키가 비어있어도) 기관 로그인 상태로 간주
        const localOk = Boolean(inst && typeof inst === 'object')

        if (supabase) {
          const { data } = await supabase.auth.getSession()
          const session = data?.session
          if (session) {
            const prof = await getProfileByUserId(session.user.id)
            if (prof?.role === 'institution_admin') {
              router.replace('/institution/dashboard')
              return
            }
          }
        }

        if (localOk) {
          router.replace('/institution/dashboard')
          return
        }
      } catch {
        // ignore
      }

      // supabase/localStorage가 아직 동기화되기 전일 수 있어서 잠깐 더 기다렸다가 다시 판단
      window.setTimeout(() => {
        try {
          const raw2 = window.localStorage.getItem(AUTH_KEY)
          const parsed2 = raw2 ? JSON.parse(raw2) : null
          const inst2 = parsed2?.currentInstitution
          if (inst2 && typeof inst2 === 'object') {
            router.replace('/institution/dashboard')
            return
          }
        } catch {
          // ignore
        }
        setChecked(true)
      }, 400)
    }

    void run()
  }, [router])

  if (!checked) return null

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-2">기관용 로그인이 필요합니다</h1>
        <p className="text-sm text-slate-600 mb-6">
          기관 대시보드를 보려면 먼저 기관 담당자 계정으로 로그인해 주세요.
        </p>

        <Link
          href="/institution-login"
          className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          기관 로그인 하러가기
        </Link>
      </div>
    </div>
  )
}

