'use client'

import Link from 'next/link'
import { ArrowRight, BarChart3, Clock } from 'lucide-react'

const SIM_ROLES = [
  {
    id: 'pm',
    badge: '서비스 기획 (PM)',
    title: 'PM 실무 역량 리허설',
    duration: '약 30~40분',
    image:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'da',
    badge: '데이터 분석가 (Data Analyst)',
    title: 'DA 실무 역량 리허설',
    duration: '약 30~40분',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'marketer',
    badge: '마케터 (Marketer)',
    title: '마케팅 실무 역량 리허설',
    duration: '약 30~40분',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
  },
] as const

export default function SimulationIndexPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] w-full">
      <div className="max-w-7xl mx-auto w-full py-12 sm:py-16 px-4 sm:px-6">
        <div className="mb-8 sm:mb-10">
          <p className="text-xs sm:text-sm font-semibold text-indigo-600 uppercase tracking-[0.18em] mb-2">
            JOB-EX Simulation
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B] mb-2">
            자빅스(JOB-EX) 실전 시뮬레이션
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            1~3단계는 주관식 제출 후 바로 AI 피드백과 모범 답안을 받고, 4단계에서 최종 리포트를 확인합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {SIM_ROLES.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col"
            >
              <div className="relative">
                <img src={role.image} alt={role.title} className="w-full h-40 sm:h-48 object-cover" />
                <span className="absolute left-4 top-4 inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-600/90 text-white shadow-sm">
                  {role.badge}
                </span>
              </div>
              <div className="flex-1 flex flex-col p-5 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">{role.title}</h2>
                <p className="flex items-center gap-1 text-xs sm:text-sm text-slate-500 mb-4">
                  <Clock className="w-4 h-4" />
                  {role.duration}
                </p>
                <div className="mt-auto">
                  <Link
                    href={`/simulation/${role.id}`}
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all"
                  >
                    <BarChart3 className="w-4 h-4" />
                    시작하기
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
