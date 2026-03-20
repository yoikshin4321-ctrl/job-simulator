'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const AUTH_KEY = 'job_sim_auth'

function generateInstitutionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 헷갈리는 I,O,0,1 제외
  let out = ''
  for (let i = 0; i < 8; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

export default function InstitutionSignupPage() {
  const router = useRouter()

  const [step, setStep] = useState<1 | 2>(1)

  const [institutionName, setInstitutionName] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [password, setPassword] = useState('')
  const [contactEmail, setContactEmail] = useState('job-ex@gmail.com')

  const [institutionCode, setInstitutionCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setInstitutionCode(generateInstitutionCode())
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.localStorage.getItem(AUTH_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (parsed?.currentInstitution) {
        router.replace('/institution/dashboard')
      }
    } catch {
      // ignore
    }
  }, [router])

  const canNext = useMemo(() => {
    if (step !== 1) return true
    return institutionName.trim() && adminName.trim() && adminEmail.trim()
  }, [institutionName, adminName, adminEmail, step])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!institutionName.trim() || !adminName.trim() || !adminEmail.trim() || !password.trim()) {
      setError('기관명/담당자/이메일/비밀번호를 모두 입력해 주세요.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    if (typeof window === 'undefined') return

    let store: {
      users: any[]
      institutions: any[]
      currentUser: any | null
      currentInstitution: any | null
    } = { users: [], institutions: [], currentUser: null, currentInstitution: null }

    const raw = window.localStorage.getItem(AUTH_KEY)
    if (raw) {
      try {
        store = JSON.parse(raw) || store
      } catch {
        // ignore
      }
    }

    const exists = (store.institutions || []).find((ins) => ins.adminEmail === adminEmail.trim())
    if (exists) {
      setError('이미 가입된 기관 담당자 이메일입니다. 기관 로그인 페이지로 이동해 주세요.')
      return
    }

    const newInstitution = {
      institutionName: institutionName.trim(),
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim(),
      password,
      contactEmail: contactEmail.trim() || 'job-ex@gmail.com',
      institutionCode,
      createdAt: new Date().toISOString(),
    }

    store.institutions = [...(store.institutions || []), newInstitution]
    store.currentInstitution = {
      adminEmail: newInstitution.adminEmail,
      institutionName: newInstitution.institutionName,
      institutionCode: newInstitution.institutionCode,
    }
    store.currentUser = null

    window.localStorage.setItem(AUTH_KEY, JSON.stringify(store))
    router.replace('/institution/dashboard')
  }

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 flex flex-col lg:flex-row gap-8">
        <div className="lg:w-[40%] lg:border-r lg:pr-6">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">기관용</p>
          <h1 className="text-xl font-bold text-slate-900 mb-2">대학/기업용 서비스 도입 문의 관리</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            기관 계약 후, 학생/취준생의 시뮬레이션 데이터를 통계로 확인할 수 있습니다.
          </p>
          <div className="mt-6 rounded-xl bg-[#F8FAFF] border border-indigo-50 p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-700 mb-1">사용 방법</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>기관 담당자 계정을 생성합니다.</li>
              <li>기관 코드가 생성됩니다.</li>
              <li>학생/취준생은 일반 회원가입에서 기관 코드를 입력합니다.</li>
            </ol>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-5">
            <p className="text-xs text-slate-600 font-medium">
              기관 회원가입 · {step}단계 / 2단계
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-900">1단계 · 기관 정보</h2>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="institutionName">
                    기관명
                  </label>
                  <input
                    id="institutionName"
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="OO대학교 / OO기업"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="adminName">
                    담당자 이름
                  </label>
                  <input
                    id="adminName"
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="홍길동"
                  />
                </div>

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
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-900">2단계 · 로그인 정보 & 기관 코드</h2>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-xs font-semibold text-indigo-600 mb-2">학생/취준생이 입력할 기관 코드</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm sm:text-base font-bold text-slate-900">{institutionCode}</p>
                    <button
                      type="button"
                      onClick={() => setInstitutionCode(generateInstitutionCode())}
                      className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      코드 재생성
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="contactEmail">
                    컨택 이메일
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="job-ex@gmail.com"
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
              </div>
            )}

            {error && <p className="text-xs text-rose-600">{error}</p>}

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 sm:px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                이전
              </button>

              {step === 1 && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canNext}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-all disabled:opacity-60"
                >
                  다음
                </button>
              )}

              {step === 2 && (
                <button
                  type="submit"
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-all"
                >
                  기관 계정 생성
                </button>
              )}
            </div>
          </form>

          <p className="mt-4 text-xs text-slate-500 text-center md:text-left">
            이미 계정이 있다면{' '}
            <Link href="/institution-login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              기관 로그인
            </Link>
            으로 이동해 주세요.
          </p>
        </div>
      </div>
    </div>
  )
}

