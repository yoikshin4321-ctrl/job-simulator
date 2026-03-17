import { Link } from 'react-router-dom'
import { Database, Brain, Target, Compass, PlayCircle, FileBarChart, ArrowRight, Handshake } from 'lucide-react'

const FEATURES = [
  {
    icon: Database,
    title: '검증된 직무 데이터',
    description:
      'Careerexplorer 등 신뢰할 수 있는 글로벌 데이터를 기반으로 설계된 역량 모델링.',
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
    description:
      '시뮬레이션 결과를 바탕으로 당신에게 가장 잘 맞는 직무와 역량 스코어를 제시합니다.',
  },
]

const STEPS = [
  { icon: Compass, label: '직무 탐색', sub: 'Explore', path: '/explore' },
  { icon: PlayCircle, label: '과제 수행', sub: 'Simulate', path: '/simulation' },
  { icon: FileBarChart, label: 'AI 리포트 확인', sub: 'Report', path: '/simulation' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F8FAFC] border-b border-slate-200/60 w-full">
        <div className="max-w-7xl mx-auto w-full py-20 sm:py-28 px-4 sm:px-6 flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E293B] tracking-tight mb-6 leading-tight text-center">
            글로벌 직무 분석 데이터 기반,<br />
            AI가 피드백하는 실무 시뮬레이션
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed text-center">
            PM, 데이터, 마케팅 실무를 미리 경험하고, 당신의 커리어 적합도를 확인하세요.
          </p>
          <Link
            to="/simulation"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            지금 바로 시뮬레이션 시작하기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Why Us - 특징 세션 */}
      <section className="py-16 sm:py-24 bg-[#F8FAFC] w-full">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col items-center text-center">
          <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] text-center mb-4">
            Why Us?
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-xl mx-auto">
            데이터와 AI로 설계된 실무 시뮬레이션으로, 당신의 역량을 객관적으로 점검합니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        </div>
      </section>

      {/* 서비스 흐름 - 3단계 */}
      <section className="py-16 sm:py-24 bg-white border-y border-slate-200/60 w-full">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col items-center text-center">
          <div className="max-w-4xl mx-auto w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] text-center mb-12">
            서비스 흐름
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon
              return (
              <div key={step.label} className="flex flex-col md:flex-row items-center justify-center flex-1 text-center">
                <Link
                  to={step.path}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border-2 border-slate-200 flex items-center justify-center mb-4 group-hover:border-indigo-300 group-hover:bg-indigo-50/50 transition-colors shadow-sm">
                    <StepIcon className="w-8 h-8 text-slate-700 group-hover:text-indigo-600" />
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                    Step {index + 1}
                  </span>
                  <span className="font-bold text-[#1E293B]">{step.label}</span>
                  <span className="text-sm text-slate-500 mt-0.5">{step.sub}</span>
                </Link>
                {index < STEPS.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-slate-300 mt-4 md:mt-0 md:mx-2 flex-shrink-0 hidden md:block" />
                )}
              </div>
              )
            })}
          </div>
          </div>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="py-16 sm:py-24 bg-[#F8FAFC] w-full">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col items-center text-center">
          <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] mb-4">
            당신의 커리어를 업그레이드하세요
          </h2>
          <p className="text-slate-600 mb-8">
            실무 시뮬레이션으로 역량을 점검하고, AI 피드백으로 다음 단계를 준비하세요.
          </p>
          <Link
            to="/simulation"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-[#1E293B] text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-sm"
          >
            시뮬레이션 시작하기
            <ArrowRight className="w-5 h-5" />
          </Link>
          </div>
        </div>
      </section>

      {/* 기업 파트너십 및 채용 연계 */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200/60 w-full">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B] mb-2">
              기업 파트너십 및 채용 연계
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
              우수한 시뮬레이션 결과를 보유한 인재를 파트너사에 직접 매칭해 드립니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {['쿠팡', '토스', '배달의민족', '네이버', '카카오', '당근마켓'].map((name) => (
              <div
                key={name}
                className="h-12 px-6 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 font-semibold text-base tracking-tight hover:bg-slate-200/80 transition-colors"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
