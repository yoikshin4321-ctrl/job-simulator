'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { notifyAuthStorageUpdated } from '../../src/lib/authEvents'
import { requestNavAuthRefresh } from '../../src/lib/navAuthSync'
import { isLikelyDeployedHostname, supabase } from '../../src/lib/supabaseClient'
import { formatSupabaseLikeError, getProfileByUserId, upsertProfile } from '../../src/lib/supabaseDb'

const AUTH_KEY = 'job_sim_auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.localStorage.getItem(AUTH_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (parsed?.currentUser) {
        router.replace('/')
      }
    } catch {
      // ignore parse error
    }
  }, [router])

  // Supabase 세션이 있으면 로그인 상태로 간주 (localStorage와 별개: 멀티디바이스 대응)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!supabase) return

    ;(async () => {
      const { data } = await supabase.auth.getSession()
      const session = data?.session
      if (!session) return

      const prof = await getProfileByUserId(session.user.id)
      if (!prof) return

      router.replace(prof.role === 'institution_admin' ? '/institution/dashboard' : '/')
    })().catch(() => {
      // ignore
    })
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (typeof window === 'undefined') return

    // 1) Supabase 기반 로그인 시도 (가능하면)
    if (supabase) {
      supabase
        .auth
        .signInWithPassword({ email: email.trim(), password })
        .then(async ({ data, error }) => {
          if (error) throw error
          const userId = data.user?.id
          if (!userId) throw new Error('Supabase user not found')

          let prof = await getProfileByUserId(userId)
          // 과거에 auth만 생성되고 profiles 행이 없던 경우(특히 배포 환경) 복구
          if (!prof) {
            const emailLocal = email.trim()
            const displayName = emailLocal.includes('@') ? emailLocal.split('@')[0] : emailLocal || '사용자'
            const repair = await upsertProfile({
              userId,
              role: 'student',
              name: displayName,
              school: '',
              major: '',
              status: '',
              interests: [],
              institution_code: '',
            })
            if (!repair.ok) {
              throw new Error(`프로필이 없고 DB 복구에도 실패했습니다: ${formatSupabaseLikeError(repair.error)}`)
            }
            prof = await getProfileByUserId(userId)
          }
          if (!prof) throw new Error('프로필 정보를 불러오지 못했습니다.')

          // 기존 UI 호환을 위해 localStorage에도 동일 shape로 저장 (안전: 삭제하지 않음)
          const next = {
            users: [],
            institutions: [],
            currentUser: prof.role === 'student' ? { email: email.trim(), name: prof.name } : null,
            currentInstitution:
              prof.role === 'institution_admin'
                ? { adminEmail: email.trim(), institutionName: '기관', institutionCode: '' }
                : null,
          } as any

          window.localStorage.setItem(AUTH_KEY, JSON.stringify(next))
          notifyAuthStorageUpdated()
          requestNavAuthRefresh()

          router.replace(prof.role === 'institution_admin' ? '/institution/dashboard' : '/')
        })
        .catch((e: any) => {
          if (isLikelyDeployedHostname()) {
            setError(`Supabase 로그인 실패: ${e?.message || formatSupabaseLikeError(e)}`)
            return
          }
          // 2) 로컬 개발: Supabase 실패 시 기존 localStorage 로그인으로 fallback
          const raw = window.localStorage.getItem(AUTH_KEY)
          if (!raw) {
            setError('가입된 계정을 먼저 생성해 주세요.')
            return
          }

          try {
            const parsed = JSON.parse(raw)
            const users = parsed?.users || []
            const found = users.find((u: any) => u.email === email.trim())
            if (!found || found.password !== password) {
              setError('이메일 또는 비밀번호가 올바르지 않습니다.')
              return
            }

            const next = {
              ...parsed,
              currentUser: { email: found.email, name: found.name },
            }
            window.localStorage.setItem(AUTH_KEY, JSON.stringify(next))
            notifyAuthStorageUpdated()
            requestNavAuthRefresh()
            router.replace('/')
          } catch {
            setError('로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
          }
        })
      return
    }

    // Supabase 미설정인 경우: 기존 localStorage 로그인만 사용
    const raw = window.localStorage.getItem(AUTH_KEY)
    if (!raw) {
      setError('가입된 계정을 먼저 생성해 주세요.')
      return
    }

    try {
      const parsed = JSON.parse(raw)
      const users = parsed?.users || []
      const found = users.find((u: any) => u.email === email.trim())
      if (!found || found.password !== password) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
        return
      }

      const next = {
        ...parsed,
        currentUser: { email: found.email, name: found.name },
      }
      window.localStorage.setItem(AUTH_KEY, JSON.stringify(next))
      notifyAuthStorageUpdated()
      requestNavAuthRefresh()
      router.replace('/')
    } catch {
      setError('로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-2">로그인</h1>
        <p className="text-sm text-slate-500 mb-6">
          직무 시뮬레이션 결과와 리포트를 안전하게 저장하려면 로그인해 주세요.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="you@example.com"
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
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 rounded-2xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            로그인
          </button>
        </form>
        <p className="mt-4 text-xs text-slate-500 text-center">
          아직 계정이 없다면{' '}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
            회원가입
          </Link>
          을 먼저 진행해 주세요.
        </p>
        <p className="mt-3 text-xs text-slate-500 text-center">
          기관 담당자라면{' '}
          <Link href="/institution-login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            기관 로그인
          </Link>
          으로 이동해 주세요.
        </p>
      </div>
    </div>
  )
}

