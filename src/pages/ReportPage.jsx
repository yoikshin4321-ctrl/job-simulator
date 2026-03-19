'use client'

import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Target,
  Brain,
  MessageSquare,
  Wrench,
  Zap,
} from 'lucide-react'

const SKILL_ICONS = {
  '문제 정의': Target,
  '논리적 사고': Brain,
  '비즈니스 커뮤니케이션': MessageSquare,
  '도구 이해도': Wrench,
  '실행 전략': Zap,
}

const ROLE_DATA = {
  pm: {
    name: 'PM (Product Manager)',
    radarData: [
      { subject: '문제 정의', value: 82, fullMark: 100 },
      { subject: '논리적 사고', value: 88, fullMark: 100 },
      { subject: '비즈니스 커뮤니케이션', value: 85, fullMark: 100 },
      { subject: '도구 이해도', value: 70, fullMark: 100 },
      { subject: '실행 전략', value: 78, fullMark: 100 },
    ],
    totalScore: 81,
    aiReview:
      '문제 정의와 비즈니스 커뮤니케이션 역량이 우수합니다. 제한된 리소스 안에서 우선순위를 정하는 논리적 사고가 돋보였어요. 다만 Jira, Notion 등 협업 도구 활용 경험을 쌓고, 스프린트 기반 실행 전략 수립 능력을 보강하면 시니어 PM으로 성장할 수 있습니다.',
  },
  data: {
    name: '데이터 애널리스트 (Data Analyst)',
    radarData: [
      { subject: '문제 정의', value: 85, fullMark: 100 },
      { subject: '논리적 사고', value: 92, fullMark: 100 },
      { subject: '비즈니스 커뮤니케이션', value: 72, fullMark: 100 },
      { subject: '도구 이해도', value: 88, fullMark: 100 },
      { subject: '실행 전략', value: 80, fullMark: 100 },
    ],
    totalScore: 83,
    aiReview:
      '가설 수립과 데이터 기반 분석 능력이 뛰어납니다. SQL, Python 등 도구 이해도도 양호해요. 숫자를 비즈니스 언어로 번역해 경영진에게 전달하는 스토리텔링 역량을 키우면, 데이터 애널리스트로서의 임팩트가 크게 늘어납니다.',
  },
  marketing: {
    name: '마케터 (Marketer)',
    radarData: [
      { subject: '문제 정의', value: 78, fullMark: 100 },
      { subject: '논리적 사고', value: 75, fullMark: 100 },
      { subject: '비즈니스 커뮤니케이션', value: 85, fullMark: 100 },
      { subject: '도구 이해도', value: 72, fullMark: 100 },
      { subject: '실행 전략', value: 80, fullMark: 100 },
    ],
    totalScore: 78,
    aiReview:
      '타겟 페르소나 정의와 채널별 메시징 감각이 좋습니다. 데이터 기반 의사결정(GA4, ROAS 분석)과 카피 테스트 설계 능력을 보강하면, 퍼포먼스 마케터로서 더 높은 성과를 낼 수 있습니다.',
  },
}

const RECOMMENDATIONS = {
  pm: [
    { type: '강의', title: '실무 PM을 위한 애자일 스크럼', source: '인프런', url: '#' },
    { type: '강의', title: 'Jira로 배우는 백로그 관리', source: '유데미', url: '#' },
    { type: '도서', title: '린 스타트업', source: '에릭 리스', url: '#' },
  ],
  data: [
    { type: '강의', title: 'SQL로 배우는 데이터 분석 기초', source: '인프런', url: '#' },
    { type: '강의', title: '비즈니스 데이터 스토리텔링', source: '유데미', url: '#' },
    { type: '도서', title: '데이터 분석의 힘', source: '정형권', url: '#' },
  ],
  marketing: [
    { type: '강의', title: '퍼포먼스 마케팅 입문', source: '인프런', url: '#' },
    { type: '강의', title: 'GA4 마스터하기', source: '유데미', url: '#' },
    { type: '도서', title: '추적 불가능한 광고', source: '세스 고딘', url: '#' },
  ],
}

export default function ReportPage() {
  const router = useRouter()
  const rawRole = router.query.role
  const role = (Array.isArray(rawRole) ? rawRole[0] : rawRole) || 'pm'
  const data = ROLE_DATA[role] || ROLE_DATA.pm
  const recommendations = RECOMMENDATIONS[role] || RECOMMENDATIONS.pm

  return (
    <div className="min-h-screen bg-white w-full">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        {/* 상단 섹션 */}
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B] mb-2">
            AI 역량 분석 리포트
          </h1>
          <p className="text-slate-600 mb-6">{data.name}</p>
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-50 border-4 border-indigo-200">
            <span className="text-2xl font-bold text-indigo-600">{data.totalScore}</span>
          </div>
          <p className="text-slate-500 text-sm mt-2">종합 점수 (100점 만점)</p>
        </div>

        {/* 역량 시각화 - 5각형 레이더 + 막대 그래프 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-[#1E293B] mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            역량 시각화
          </h2>

          {/* 5각형 방사형 차트 (SVG) */}
          <div className="flex justify-center mb-8">
            <svg viewBox="0 0 220 220" className="w-56 h-56 mx-auto">
              {/* 격자선 (5각형) */}
              {[0, 1, 2, 3, 4].map((ring) => {
                const r = 40 + ring * 20
                const points = [0, 1, 2, 3, 4].map((i) => {
                  const angle = (i * 72 - 90) * (Math.PI / 180)
                  return `${110 + r * Math.cos(angle)},${110 + r * Math.sin(angle)}`
                })
                return (
                  <polygon
                    key={ring}
                    points={points.join(' ')}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                )
              })}
              {/* 축선 */}
              {[0, 1, 2, 3, 4].map((i) => {
                const angle = (i * 72 - 90) * (Math.PI / 180)
                return (
                  <line
                    key={i}
                    x1="110"
                    y1="110"
                    x2={110 + 100 * Math.cos(angle)}
                    y2={110 + 100 * Math.sin(angle)}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                )
              })}
              {/* 데이터 영역 (값에 따른 5각형) */}
              <polygon
                points={data.radarData
                  .map((d, i) => {
                    const r = 80 * (d.value / 100)
                    const angle = (i * 72 - 90) * (Math.PI / 180)
                    return `${110 + r * Math.cos(angle)},${110 + r * Math.sin(angle)}`
                  })
                  .join(' ')}
                fill="#4F46E5"
                fillOpacity="0.35"
                stroke="#4F46E5"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* 막대 그래프 (아이콘 + 수치) */}
          <div className="space-y-4">
            {data.radarData.map((item, i) => {
              const Icon = SKILL_ICONS[item.subject]
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    {Icon && <Icon className="w-4 h-4 text-indigo-600" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{item.subject}</span>
                      <span className="font-bold text-indigo-600">{item.value}점</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-700"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI 총평 */}
        <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-[#1E293B] mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI 총평
          </h2>
          <p className="text-slate-700 text-sm leading-relaxed">{data.aiReview}</p>
        </div>

        {/* 커리어 로드맵 */}
        <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              커리어 로드맵 — 추천 학습
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              부족한 역량을 채우기 위한 강의·도서 추천
            </p>
          </div>
          <div className="p-6 space-y-4">
            {recommendations.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors"
              >
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  {item.type === '도서' ? (
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1E293B]">{item.title}</p>
                  <p className="text-slate-500 text-sm">{item.source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/simulation"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-colors"
          >
            다른 직무 시뮬레이션 도전하기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
