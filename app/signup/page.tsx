'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const AUTH_KEY = 'job_sim_auth'

const INTEREST_OPTIONS = ['PM', '데이터 분석', '마케팅', '디자인']

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Step 1 - 기본 정보
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Step 2 - 소속 및 상태
  const [school, setSchool] = useState('')
  const [major, setMajor] = useState('')
  const [status, setStatus] = useState('대학교 재학')

  // Step 3 - 관심 직무
  const [interests, setInterests] = useState<string[]>([])

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
      // ignore
    }
  }, [router])

  const toggleInterest = (label: string) => {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((v) => v !== label) : [...prev, label],
    )
  }

  const handleNext = () => {
    setError('')
    // 간단한 단계별 검증
    if (step === 1) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('이름, 이메일, 비밀번호를 모두 입력해 주세요.')
        return
      }
      if (password.length < 6) {
        setError('비밀번호는 6자 이상이어야 합니다.')
        return
      }
    }
    if (step === 2) {
      if (!school.trim() || !major.trim()) {
        setError('학교/기관명과 전공을 입력해 주세요.')
        return
      }
    }
    setStep((prev) => Math.min(prev + 1, 3))
  }

  const handlePrev = () => {
    setError('')
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (typeof window === 'undefined') return

    let store: { users: any[]; currentUser: any | null } = { users: [], currentUser: null }
    const raw = window.localStorage.getItem(AUTH_KEY)
    if (raw) {
      try {
        store = JSON.parse(raw) || store
      } catch {
        // ignore and overwrite
      }
    }

    const exists = store.users.find((u) => u.email === email.trim())
    if (exists) {
      setError('이미 가입된 이메일입니다. 로그인 페이지로 이동해 주세요.')
      return
    }

    const newUser = {
      name: name.trim(),
      email: email.trim(),
      password,
      school: school.trim(),
      major: major.trim(),
      status,
      interests,
      createdAt: new Date().toISOString(),
    }

    const next = {
      users: [...(store.users || []), newUser],
      currentUser: { email: newUser.email, name: newUser.name },
    }

    window.localStorage.setItem(AUTH_KEY, JSON.stringify(next))
    router.replace('/')
  }

  const progress = (step / 3) * 100

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 flex flex-col md:flex-row gap-8">
        {/* 왼쪽: 서비스 소개 영역 */}
        <div className="hidden md:flex md:w-[40%] flex-col justify-between border-r border-slate-100 pr-6">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">
              Onboarding
            </p>
            <h1 className="text-xl font-bold text-slate-900 mb-3">
              나에게 맞는 직무 리허설을 준비해 볼까요?
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              몇 가지 질문에 답하면, 당신의 배경과 관심사에 맞는 직무 시뮬레이션을 우선
              추천해 드립니다. 온보딩을 마치면, 언제든 다시 로그인해 성장 과정을 이어갈 수
              있어요.
            </p>
          </div>
          <div className="mt-8 rounded-xl bg-[#F8FAFF] border border-indigo-50 p-4 text-xs text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-700 mb-1">Tip</p>
            <p>
              관심 직무는 나중에 설정에서 다시 변경할 수 있으니, 지금 가장 끌리는
              방향을 가볍게 선택해 보셔도 괜찮아요.
            </p>
          </div>
        </div>

        {/* 오른쪽: 단계별 온보딩 폼 */}
        <div className="w-full md:w-[60%]">
          {/* 상단 단계 표시 & 프로그레스 바 */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-slate-600">
                회원가입 온보딩 · 3단계 중 {step}단계
              </p>
              <p className="text-xs text-slate-400">
                {step === 1 && '기본 정보 입력'}
                {step === 2 && '학력/배경 정보'}
                {step === 3 && '관심 직무 선택'}
              </p>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Account */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-sm font-semibold text-slate-900">1단계 · 기본 정보</h2>
                <p className="text-xs text-slate-500">
                  로그인을 위한 기본 계정 정보를 입력해 주세요.
                </p>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">
                    이름
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="홍길동"
                  />
                </div>
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
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1"
                    htmlFor="password"
                  >
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

            {/* Step 2: Background */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-sm font-semibold text-slate-900">2단계 · 소속 및 상태</h2>
                <p className="text-xs text-slate-500">
                  현재 소속과 상황을 알려주시면, 보다 적합한 리허설을 추천해 드릴 수 있어요.
                </p>
                <div>
                  <label
                    className="block text-sm font-medium text-slate-700 mb-1"
                    htmlFor="school"
                  >
                    학교/기관명
                  </label>
                  <input
                    id="school"
                    type="text"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="OO대학교 / OO교육원 / 재직 중인 회사 등"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="major">
                    전공 / 직무 분야
                  </label>
                  <input
                    id="major"
                    type="text"
                    required
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="예: 경영학 / 컴퓨터공학 / 마케팅 등"
                  />
                </div>
                <div>
                  <p className="block text-sm font-medium text-slate-700 mb-2">현재 상태</p>
                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                    {['대학교 재학', '졸업 예정', '취업 준비 중', '현직자'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setStatus(option)}
                        className={`px-3 py-2 rounded-xl border text-left transition-all ${
                          status === option
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Interest */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h2 className="text-sm font-semibold text-slate-900">3단계 · 관심 직무 선택</h2>
                <p className="text-xs text-slate-500 mb-2">
                  선택하신 직무에 맞는 시뮬레이션을 우선 추천해 드립니다.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                  {INTEREST_OPTIONS.map((label) => {
                    const selected = interests.includes(label)
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleInterest(label)}
                        className={`px-3 py-2 rounded-xl border transition-all ${
                          selected
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-slate-400">
                  최소 1개 이상 선택하면, 프로필에서 직무 추천에 활용됩니다.
                </p>
              </div>
            )}

            {error && <p className="text-xs text-red-600">{error}</p>}

            {/* 하단 버튼 영역 */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={step === 1 ? () => router.push('/login') : handlePrev}
                className="px-3 sm:px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
              >
                {step === 1 ? '이미 계정이 있어요' : '이전 단계'}
              </button>

              {step < 3 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-all"
                >
                  다음
                </button>
              )}

              {step === 3 && (
                <button
                  type="submit"
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-all"
                >
                  가입 완료
                </button>
              )}
            </div>
          </form>

          <p className="mt-4 text-xs text-slate-500 text-center md:text-left">
            이미 계정이 있다면{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              로그인
            </Link>
            으로 이동해 주세요.
          </p>
        </div>
      </div>
    </div>
  )
}

