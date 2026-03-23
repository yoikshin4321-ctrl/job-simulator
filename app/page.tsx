'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Database, Brain, Target, Compass, PlayCircle, FileBarChart, ArrowRight, Handshake } from 'lucide-react'
import { supabase } from '../src/lib/supabaseClient'
import { fetchFeatureActivityEventsForInstitution, getProfileByUserId } from '../src/lib/supabaseDb'
import { loadLocalFeatureEventsForInstitution } from '../src/lib/featureActivity'

const AUTH_KEY = 'job_sim_auth'

const FEATURES = [
  {
    icon: Database,
    title: '직무 DB 기반 검증된 탐색',
    description: '직무별 수행·평가 기준을 구조화한 DB로, 학생이 정확한 준비 방향을 잡도록 돕습니다.',
  },
  {
    icon: Brain,
    title: 'AI 진단 리포트 맞춤 피드백',
    description: '과제 수행 결과를 기반으로 준비 수준·강점·부족 역량을 분석하고 필요한 경험/학습 방향까지 제시합니다.',
  },
  {
    icon: Target,
    title: '기관 대시보드로 후속 연계',
    description: '관리자 전용 페이지에서 학생별 이력·준비도·부족 역량·상담 우선순위를 한눈에 확인하고, 맞춤 상담과 후속 프로그램 연계를 운영합니다.',
  },
]

const STEPS = [
  { icon: Compass, label: '직무 탐색', sub: 'Explore', path: '/explore' },
  { icon: PlayCircle, label: '과제 수행', sub: 'Simulate', path: '/simulation' },
  { icon: FileBarChart, label: 'AI 리포트 확인', sub: 'Report', path: '/simulation' },
]

const PROCESS_STEPS = [
  { label: '직무 체험(리허설)', description: '관심 직무를 실제 업무 기반 과제로 체험하고 수행합니다.' },
  { label: 'AI 진단 리포트', description: 'AI가 준비 수준·강점·부족 역량을 분석한 리포트를 제공합니다.' },
  { label: '맞춤 피드백 & 준비 방향', description: '부족 역량 보완을 위한 경험·학습 방향을 구체적으로 안내합니다.' },
  { label: '기관 상담 & 후속 연계', description: '기관 관리자가 학생 정보를 바탕으로 맞춤 상담과 후속 프로그램 연계를 진행합니다.' },
]

const TRUST_METRICS = [
  { label: '누적 참여자', value: '5,000명+' },
  { label: '기관 인증 배지 발급', value: '1,200건+' },
  { label: '제휴 대학/기관', value: '20곳+' },
]

const PARTNERS = ['OO대학교', '△△대학교', 'ABC Corp.', 'Startup X', 'Edu Partner']

export default function HomePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const navigatingRef = useRef(false)
  const [institutionPreview, setInstitutionPreview] = useState({
    careerTestCount: 0,
    mentorQuestionCount: 0,
    pickViewedCount: 0,
    vodWatchedCount: 0,
    vodWatchSeconds: 0,
  })

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_KEY) : null
      if (!raw) return
      const parsed = JSON.parse(raw)
      const current = parsed?.currentUser
      const users = parsed?.users || []
      if (!current) return
      const fullUser = users.find((u: any) => u.email === current.email) || current
      setProfile({
        name: fullUser.name || current.name,
        major: fullUser.major || '',
        interests: fullUser.interests || [],
      })
    } catch {
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    try {
      const rawAuth = window.localStorage.getItem(AUTH_KEY)
      const parsedAuth = rawAuth ? JSON.parse(rawAuth) : null
      const code = parsedAuth?.currentInstitution?.institutionCode || ''

      const computeFromEvents = (events: any[]) => {
        const careerTestCount = events.filter((e) => e.eventType === 'career_test_completed').length
        const mentorQuestionCount = events.filter((e) => e.eventType === 'mentor_question_submitted').length
        const pickViewedCount = events.filter((e) => e.eventType === 'pick_viewed').length
        const vodEvents = events.filter((e) => e.eventType === 'vod_watched_completed')
        const vodWatchedCount = vodEvents.length
        const vodWatchSeconds = vodEvents.reduce((s, e) => s + Number(e.durationSeconds || 0), 0)
        return { careerTestCount, mentorQuestionCount, pickViewedCount, vodWatchedCount, vodWatchSeconds }
      }

      const localEvents = code ? (loadLocalFeatureEventsForInstitution(code) as any[]) : []
      if (!code) {
        // 데이터가 없을 때는 대시보드 미리보기용 샘플 값
        setInstitutionPreview({ careerTestCount: 18, mentorQuestionCount: 26, pickViewedCount: 72, vodWatchedCount: 44, vodWatchSeconds: 0 })
        return
      }

      // 먼저 local 기반으로 빠르게 표시하고, Supabase가 있으면 한 번 동기화
      if (localEvents.length) setInstitutionPreview(computeFromEvents(localEvents))
      else
        setInstitutionPreview({ careerTestCount: 0, mentorQuestionCount: 0, pickViewedCount: 0, vodWatchedCount: 0, vodWatchSeconds: 0 })

      // 로그인한 기관이라면 Supabase 기반 집계로 한 번 더 동기화
      if (supabase) {
        void (async () => {
          const rows = (await fetchFeatureActivityEventsForInstitution({ institutionCode: code })) as any[]
          if (!rows.length) return
          setInstitutionPreview(computeFromEvents(rows))
        })()
      }
    } catch {
      // ignore
    }
  }, [])

  const isInstitutionLoggedIn = async () => {
    try {
      const raw = window.localStorage.getItem(AUTH_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      const inst = parsed?.currentInstitution
      // localStorage에 currentInstitution 객체가 존재하면(키 누락/값 공백이어도) 기관 로그인 상태로 간주
      // (기관 대시보드는 institutionCode로 데이터가 채워지며, 로그인 플로우에서 해당 객체가 만들어짐)
      if (inst && typeof inst === 'object') return true
    } catch {
      // ignore
    }

    if (supabase) {
      try {
        const { data } = await supabase.auth.getSession()
        const session = data?.session
        if (!session) return false
        const prof = await getProfileByUserId(session.user.id)
        return prof?.role === 'institution_admin'
      } catch {
        return false
      }
    }

    return false
  }

  const handleInstitutionDashboardCta = async () => {
    if (navigatingRef.current) return
    navigatingRef.current = true
    const ok = await isInstitutionLoggedIn()
    router.push(ok ? '/institution/dashboard' : '/institution-login-required')
    // 연속 클릭/이벤트 중복 방지용(라우트 전환 즉시 해제는 브라우저/환경에 따라 불안정)
    window.setTimeout(() => {
      navigatingRef.current = false
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F8FAFC] border-b border-slate-200/60 w-full">
        <div className="max-w-7xl mx-auto w-full py-16 sm:py-24 px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1E293B] tracking-tight mb-6 leading-tight max-w-[44rem]">
              <span className="block sm:whitespace-nowrap">글로벌 직무 분석 데이터 기반,</span>
              <span className="block sm:whitespace-nowrap">
                AI가 피드백하는 실무 <span className="whitespace-nowrap">시뮬레이션</span>
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mb-8 sm:mb-10 leading-relaxed mx-auto lg:mx-0">
              <span className="block">PM, DA, 마케터 실무를 미리 경험하고,</span>
              <span className="block">당신의 커리어 적합도를 확인하세요.</span>
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start w-full max-w-xl mx-auto lg:mx-0 lg:max-w-none">
              <Link
                href="/simulation"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 w-full sm:w-auto sm:min-w-[12rem] bg-indigo-600 text-white text-sm sm:text-base font-bold rounded-2xl hover:bg-indigo-500 transition-all shadow-md hover:shadow-lg text-center"
              >
                지금 바로 시뮬레이션 시작하기
                <ArrowRight className="w-5 h-5 shrink-0" />
              </Link>
              <button
                type="button"
                onClick={() => void handleInstitutionDashboardCta()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 w-full sm:w-auto sm:min-w-[12rem] bg-white text-slate-800 text-sm sm:text-base font-semibold rounded-2xl border border-slate-200 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-md transition-all text-center"
              >
                대학/기관용 서비스 보기
              </button>
            </div>
          </div>

          {/* 대학/기관용 대시보드 프리뷰 */}
          <div className="relative w-full min-w-0">
            <div
              className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200/80 shadow-xl shadow-slate-200 overflow-hidden p-4 sm:p-5 cursor-pointer hover:border-indigo-200 transition-colors"
              role="button"
              tabIndex={0}
              onClick={() => void handleInstitutionDashboardCta()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') void handleInstitutionDashboardCta()
              }}
              aria-label="기관 대시보드로 이동"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-4 pb-1 border-b border-slate-100/80">
                <div className="min-w-0 pr-2">
                  <p className="text-sm sm:text-base font-semibold text-indigo-600 uppercase tracking-[0.18em]">
                    대학/기관용 대시보드
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug">
                    우리 기관 학생들의 실무 역량을 데이터로 관리하세요.
                  </p>
                </div>
                <span className="self-start sm:self-center shrink-0 px-2.5 py-1 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700 border border-emerald-100 whitespace-nowrap">
                  실시간
                </span>
              </div>
              <div className="h-40 sm:h-48 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center text-slate-200 text-xs sm:text-sm mt-1">
                {(() => {
                  const values = [
                    institutionPreview.careerTestCount,
                    institutionPreview.mentorQuestionCount,
                    institutionPreview.pickViewedCount,
                    institutionPreview.vodWatchedCount,
                  ]
                  const max = Math.max(...values, 1)
                  const heights = values.map((v) => Math.round(22 + (v / max) * 58))
                  return (
                    <div className="w-full max-w-xs space-y-2">
                      <div className="flex justify-between text-[10px] text-slate-300 mb-2">
                        <span>기능별 트래킹</span>
                        <span>최근 활동</span>
                      </div>
                      <div className="flex items-end gap-1 h-20">
                        {heights.map((h, i) => (
                          <div
                            // eslint-disable-next-line react/no-array-index-key
                            key={i}
                            className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-500 to-sky-400 transition-all"
                            style={{ height: `${h}%` }}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                        <span>진로검사</span>
                        <span>멘토질문</span>
                        <span>Pick</span>
                        <span>VOD</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        VOD 시청 {Math.round(institutionPreview.vodWatchSeconds / 60)}분
                      </p>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 개인화 영역: 온보딩 정보 기반 맞춤 시뮬레이션 추천 */}
      {profile && (
        <section className="py-6 sm:py-8 bg-[#F8FAFC] w-full">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all p-5 sm:p-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 lg:gap-6">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-1">
                  당신을 위한 추천
                </p>
                <h2 className="text-sm sm:text-base font-semibold text-slate-900 mb-1 break-words">
                  {profile.major
                    ? `${profile.major} 전공인 ${profile.name}님을 위한 맞춤 시뮬레이션`
                    : `${profile.name}님을 위한 맞춤 시뮬레이션`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {profile.interests && profile.interests.length > 0
                    ? `${profile.interests.join(', ')} 직무 중심의 리허설 과제를 먼저 추천해 드립니다.`
                    : '온보딩에서 선택하신 배경을 기반으로, 가장 잘 맞는 직무 리허설을 제안해 드립니다.'}
                </p>
              </div>
              <Link
                href="/simulation"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3 w-full lg:w-auto lg:shrink-0 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 shadow-sm hover:shadow-md transition-all whitespace-nowrap"
              >
                맞춤 시뮬레이션 보러가기
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Us - 특징 세션 */}
      <section className="py-16 sm:py-24 bg-[#F8FAFC] w-full">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] mb-3 sm:mb-4">Why Us?</h2>
            <p className="text-slate-600 max-w-5xl mx-auto text-center leading-relaxed text-sm sm:text-base">
              데이터와 AI로 설계된 실무 시뮬레이션으로, 당신의 역량을 객관적으로 점검합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col items-center text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5">
                    <Icon className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1E293B] mb-3">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 제휴 현황 */}
      <section className="py-12 sm:py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1E293B] mb-1">제휴 대학 및 파트너</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                전국 20개 대학 비교과 프로그램 및 기관 연계 프로젝트와 함께 운영 중입니다.
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-[11px] font-semibold text-indigo-700 border border-indigo-100">
              전국 20개 대학 비교과 프로그램 연동
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            {PARTNERS.map((name) => (
              <div
                key={name}
                className="flex items-center justify-center h-16 rounded-xl border border-slate-200 bg-[#F8FAFC] text-xs sm:text-sm font-semibold text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm hover:shadow-md transition-all"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 서비스 프로세스 - 4단계 흐름 */}
      <section className="py-14 sm:py-18 bg-[#F8FAFC] w-full">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] mb-3">서비스 프로세스</h2>
            <p className="text-sm sm:text-base text-slate-600">
              리허설 → 실무 학습 → 수행평가 → 인증서 발급까지, 직무 역량 여정을 한 번에.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
            {PROCESS_STEPS.map((step, index) => (
              <div
                key={step.label}
                className="relative bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col items-start"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-50 text-[11px] font-semibold text-indigo-700 border border-indigo-100">
                    {index + 1}
                  </span>
                  <Handshake className="w-4 h-4 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-[#1E293B] mb-2">{step.label}</p>
                <p className="text-xs sm:text-sm text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 서비스 진입 CTA */}
      <section className="py-12 sm:py-16 bg-white w-full border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-1">
              지금 시작할까요?
            </p>
            <p className="text-sm sm:text-base text-slate-700">
              지금 바로 자빅스(JOB-EX) 시뮬레이션을 시작하고, 나의 실무 준비도를 확인해 보세요.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/simulation"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
            >
              시뮬레이션 시작하기
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              직무 탐색하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

