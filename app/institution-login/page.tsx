'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { notifyAuthStorageUpdated } from '../../src/lib/authEvents'
import { requestNavAuthRefresh } from '../../src/lib/navAuthSync'
import { isLikelyDeployedHostname, supabase } from '../../src/lib/supabaseClient'
import { formatSupabaseLikeError, getInstitutionByAdmin, getProfileByUserId } from '../../src/lib/supabaseDb'

const AUTH_KEY = 'job_sim_auth'

export default function InstitutionLoginPage() {
  const router = useRouter()
  const [adminEmail, setAdminEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.localStorage.getItem(AUTH_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (parsed?.currentInstitution) router.replace('/institution/dashboard')
    } catch {
      // ignore
    }
  }, [router])

  // Supabase 세션이 있으면 기관 대시보드로 이동 (멀티디바이스 대응)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!supabase) return

    ;(async () => {
      const { data } = await supabase.auth.getSession()
      const session = data?.session
      if (!session) return

      const prof = await getProfileByUserId(session.user.id)
      if (!prof || prof.role !== 'institution_admin') return

      router.replace('/institution/dashboard')
    })().catch(() => {
      // ignore
    })
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (typeof window === 'undefined') return

    const email = adminEmail.trim()

    // 1) Supabase 기반 로그인
    if (supabase) {
      supabase
        .auth
        .signInWithPassword({ email, password })
        .then(async ({ data, error }) => {
          if (error) throw error

          const userId = data.user?.id
          if (!userId) throw new Error('Supabase user not found')

          const inst = await getInstitutionByAdmin(userId)
          const prof = await getProfileByUserId(userId)
          if (!inst || !prof) throw new Error('기관 프로필/기관 정보를 불러오지 못했습니다.')

          const next = {
            users: [],
            institutions: [],
            currentInstitution: {
              adminEmail: email,
              institutionName: inst.institution_name,
              institutionCode: inst.institution_code,
            },
            currentUser: null,
          }

          window.localStorage.setItem(AUTH_KEY, JSON.stringify(next))
          notifyAuthStorageUpdated()
          requestNavAuthRefresh()
          router.replace('/institution/dashboard')
        })
        .catch((e: any) => {
          if (isLikelyDeployedHostname()) {
            setError(`Supabase 기관 로그인 실패: ${e?.message || formatSupabaseLikeError(e)}`)
            return
          }
          // 2) 로컬: Supabase 실패 시 localStorage fallback
          const raw = window.localStorage.getItem(AUTH_KEY)
          if (!raw) {
            setError('기관 계정을 먼저 생성해 주세요.')
            return
          }
          try {
            const parsed = JSON.parse(raw)
            const institutions = parsed?.institutions || []
            const found = institutions.find((ins: any) => ins.adminEmail === email)
            if (!found || found.password !== password) {
              setError('이메일 또는 비밀번호가 올바르지 않습니다.')
              return
            }

            parsed.currentInstitution = {
              adminEmail: found.adminEmail,
              institutionName: found.institutionName,
              institutionCode: found.institutionCode,
            }
            parsed.currentUser = null

            window.localStorage.setItem(AUTH_KEY, JSON.stringify(parsed))
            notifyAuthStorageUpdated()
            refreshAuth()
            router.replace('/institution/dashboard')
          } catch {
            setError('로그인 처리 중 오류가 발생했습니다.')
          }
        })
      return
    }

    // 3) Supabase 미설정 시 기존 localStorage 로그인만 사용
    const raw = window.localStorage.getItem(AUTH_KEY)
    if (!raw) {
      setError('기관 계정을 먼저 생성해 주세요.')
      return
    }

    try {
      const parsed = JSON.parse(raw)
      const institutions = parsed?.institutions || []
      const found = institutions.find((ins: any) => ins.adminEmail === email)
      if (!found || found.password !== password) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
        return
      }

      parsed.currentInstitution = {
        adminEmail: found.adminEmail,
        institutionName: found.institutionName,
        institutionCode: found.institutionCode,
      }
      parsed.currentUser = null

      window.localStorage.setItem(AUTH_KEY, JSON.stringify(parsed))
      notifyAuthStorageUpdated()
      requestNavAuthRefresh()
      router.replace('/institution/dashboard')
    } catch {
      setError('로그인 처리 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-2">기관 로그인</h1>
        <p className="text-sm text-slate-500 mb-6">기관 대시보드를 이용하려면 로그인해 주세요.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="adminEmail">
              기관 담당자 이메일
            </label>
            <input
              id="adminEmail"
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="admin@university.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="6자 이상 입력"
            />
          </div>
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <button className="w-full mt-2 py-2.5 px-4 rounded-2xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
            로그인
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500 text-center">
          기관 계정이 없다면{' '}
          <Link href="/institution-signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
            기관 회원가입
          </Link>
          으로 이동해 주세요.
        </p>
      </div>
    </div>
  )
}

