'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Database, Brain, Target, Compass, PlayCircle, FileBarChart, ArrowRight, Handshake } from 'lucide-react'

const AUTH_KEY = 'job_sim_auth'

const FEATURES = [
  {
    icon: Database,
    title: '검증된 직무 데이터',
    description: 'Careerexplorer 등 신뢰할 수 있는 글로벌 데이터를 기반으로 설계된 역량 모델링.',
  },
  {
    icon: Brain,
    title: '즉각적인 AI 피드백',
    description:
      '주관식 과제 제출 즉시, AI가 당신의 수행 능력을 분석하고 맞춤형 피드백을 제공합니다.',
  },
  {
    icon: Target,
    title: '실질적 커리어 매칭',
    description: '시뮬레이션 결과를 바탕으로 당신에게 가장 잘 맞는 직무와 역량 스코어를 제시합니다.',
  },
]

const STEPS = [
  { icon: Compass, label: '직무 탐색', sub: 'Explore', path: '/explore' },
  { icon: PlayCircle, label: '과제 수행', sub: 'Simulate', path: '/simulation' },
  { icon: FileBarChart, label: 'AI 리포트 확인', sub: 'Report', path: '/simulation' },
]

const PROCESS_STEPS = [
  { label: '리허설', description: '실제 기업 과제를 기반으로 직무 리허설 수행' },
  { label: '실무 학습', description: '문제 정의·데이터 해석·전략 수립 과정을 학습' },
  { label: '수행 평가', description: 'AI와 전문가 기준으로 수행 결과 평가' },
  { label: '인증서 발급', description: '역량 기반 인증서와 리포트 발급' },
]

const TRUST_METRICS = [
  { label: '누적 참여자', value: '5,000명+' },
  { label: '기업 인증 배지 발급', value: '1,200건+' },
  { label: '제휴 대학/기관', value: '20곳+' },
]

const PARTNERS = ['OO대학교', '△△대학교', 'ABC Corp.', 'Startup X', 'Edu Partner']

export default function HomePage() {
  const [profile, setProfile] = useState<any>(null)

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F8FAFC] border-b border-slate-200/60 w-full">
        <div className="max-w-7xl mx-auto w-full py-16 sm:py-24 px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E293B] tracking-tight mb-6 leading-tight max-w-[36rem]">
              <span className="block whitespace-normal">글로벌 직무 분석 데이터 기반,</span>
              <span className="block whitespace-normal">
                AI가 피드백하는 실무 <span className="whitespace-nowrap">시뮬레이션</span>
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mb-8 leading-relaxed mx-auto lg:mx-0">
              PM, 데이터, 마케팅 실무를 미리 경험하고, 당신의 커리어 적합도를 확인하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link
                href="/simulation"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all shadow-md hover:shadow-lg"
              >
                지금 바로 시뮬레이션 시작하기
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white text-slate-800 font-semibold rounded-2xl border border-slate-200 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-md transition-all"
              >
                대학/기업용 서비스 보기
              </Link>
            </div>
          </div>

          {/* 대학/기업용 대시보드 프리뷰 */}
          <div className="relative">
            <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200/80 shadow-xl shadow-slate-200 overflow-hidden p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">
                    대학/기업용 대시보드
                  </p>
                  <p className="text-[11px] text-slate-500">
                    우리 대학 학생들의 실무 역량을 데이터로 관리하세요.
                  </p>
                </div>
                <span className="px-2 py-1 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                  Live
                </span>
              </div>
              <div className="h-40 sm:h-48 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center text-slate-200 text-xs sm:text-sm">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-300 mb-2">
                    <span>직무별 준비도 분포</span>
                    <span>최근 6개월</span>
                  </div>
                  <div className="flex items-end gap-1 h-20">
                    {[70, 85, 60, 90].map((v, i) => (
                      <div
                        // eslint-disable-next-line react/no-array-index-key
                        key={i}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-500 to-sky-400 transition-all"
                        style={{ height: `${40 + v / 2}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                    <span>PM</span>
                    <span>Data</span>
                    <span>Marketing</span>
                    <span>Design</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 개인화 영역: 온보딩 정보 기반 맞춤 시뮬레이션 추천 */}
      {profile && (
        <section className="py-6 sm:py-8 bg-[#F8FAFC] w-full">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-1">
                  Personalized for You
                </p>
                <h2 className="text-sm sm:text-base font-semibold text-slate-900 mb-1">
                  {profile.major
                    ? `${profile.major} 전공인 ${profile.name}님을 위한 맞춤 시뮬레이션`
                    : `${profile.name}님을 위한 맞춤 시뮬레이션`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {profile.interests && profile.interests.length > 0
                    ? `${profile.interests.join(', ')} 직무 중심의 리허설 과제를 먼저 추천해 드립니다.`
                    : '온보딩에서 선택하신 배경을 기반으로, 가장 잘 맞는 직무 리허설을 제안해 드립니다.'}
                </p>
              </div>
              <Link
                href="/simulation"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 shadow-sm hover:shadow-md transition-all"
              >
                맞춤 시뮬레이션 보러가기
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Us - 특징 세션 */}
      <section className="py-16 sm:py-24 bg-[#F8FAFC] w-full">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] mb-4">Why Us?</h2>
            <p className="text-slate-600 mb-12 max-w-5xl mx-auto text-center leading-relaxed">
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
                전국 20개 대학 비교과 프로그램 및 기업 연계 프로젝트와 함께 운영 중입니다.
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
              Ready to Start
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

