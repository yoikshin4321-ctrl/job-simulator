'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const AUTH_KEY = 'job_sim_auth'

function safeParse(raw: string | null): any {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export default function InstitutionVerifyPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [institutionCode, setInstitutionCode] = useState('')
  const [current, setCurrent] = useState<null | { email: string; name: string; institutionCode?: string }>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const store = safeParse(window.localStorage.getItem(AUTH_KEY))
    const currentUser = store?.currentUser
    const currentInstitution = store?.currentInstitution

    if (currentInstitution) {
      router.replace('/institution/dashboard')
      return
    }

    if (!currentUser?.email) {
      router.replace('/login')
      return
    }

    const users = store?.users || []
    const found = users.find((u: any) => u.email === currentUser.email)

    setCurrent({
      email: currentUser.email,
      name: currentUser.name || found?.name || '',
      institutionCode: found?.institutionCode || '',
    })
    setInstitutionCode(found?.institutionCode || '')
    setLoading(false)
  }, [router])

  const institutionName = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const store = safeParse(window.localStorage.getItem(AUTH_KEY))
    const institutions = store?.institutions || []
    const found = institutions.find((ins: any) => ins.institutionCode === institutionCode.trim())
    return found?.institutionName || ''
  }, [institutionCode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (typeof window === 'undefined') return
    if (!current?.email) return

    const store = safeParse(window.localStorage.getItem(AUTH_KEY))
    const institutions = store?.institutions || []
    const users = store?.users || []

    const code = institutionCode.trim()
    if (!code) {
      setError('기관 코드를 입력해 주세요.')
      return
    }

    const institution = institutions.find((ins: any) => ins.institutionCode === code)
    if (!institution) {
      setError('해당 기관 코드가 존재하지 않습니다. 다시 확인해 주세요.')
      return
    }

    const nextUsers = users.map((u: any) => {
      if (u.email !== current.email) return u
      return {
        ...u,
        institutionCode: code,
      }
    })

    const next = {
      ...store,
      users: nextUsers,
      currentUser: {
        email: current.email,
        name: current.name || current.email,
      },
    }

    window.localStorage.setItem(AUTH_KEY, JSON.stringify(next))
    router.replace('/simulation')
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 text-center">
          <p className="text-sm font-semibold text-slate-900">로딩 중…</p>
          <p className="text-xs text-slate-500 mt-2">인증 정보를 확인하고 있어요.</p>
        </div>
      </div>
    )
  }

  if (!current) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 text-center">
          <p className="text-sm font-semibold text-slate-900">로그인이 필요합니다.</p>
          <Link href="/login" className="mt-3 inline-flex px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold">
            로그인하기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-6">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.18em] mb-2">
            Institution Verification
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">제휴 대학 인증</h1>
          <p className="text-sm text-slate-600 mt-2">
            기관에서 제공한 코드를 입력하면, 해당 기관의 데이터 집계에 참여할 수 있어요.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="institutionCode">
                기관 코드
              </label>
              <input
                id="institutionCode"
                type="text"
                value={institutionCode}
                onChange={(e) => setInstitutionCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="예: A1B2C3D4"
              />
              {institutionName && (
                <p className="mt-2 text-xs text-emerald-700">
                  입력된 코드로 확인된 기관: <span className="font-semibold">{institutionName}</span>
                </p>
              )}
            </div>

            {error && <p className="text-xs text-rose-600">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end pt-2">
              <button
                type="button"
                onClick={() => router.replace('/simulation')}
                className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                인증하기
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

