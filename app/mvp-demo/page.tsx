import React from 'react'
import { BarChart2, Briefcase, CheckCircle2, MessageSquareText, Mail, Sparkles, Target } from 'lucide-react'

const TRAIT_KEYS = ['문제해결', '소통', '직무이해', '완수율', '전문지식'] as const
type TraitKey = (typeof TRAIT_KEYS)[number]

function getRadarPoints(values: number[], maxRadius: number, startAngleRad: number) {
  return values
    .map((value, i) => {
      const angle = startAngleRad + (i * 2 * Math.PI) / values.length
      const radius = (value / 100) * maxRadius
      const x = 160 + radius * Math.cos(angle)
      const y = 160 + radius * Math.sin(angle)
      return `${x},${y}`
    })
    .join(' ')
}

function StepBrowserChrome({ url }: { url: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
      <div className="h-10 flex items-center justify-between px-3 border-b border-slate-200/80 bg-slate-50">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
        </div>
        <div className="flex-1 mx-3 bg-white rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] text-slate-600 truncate">
          {url}
        </div>
        <div className="w-16 flex justify-end">
          <span className="text-[11px] font-semibold text-indigo-600">MVP</span>
        </div>
      </div>
    </div>
  )
}

function TitlePill({ stepLabel }: { stepLabel: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm">
        {stepLabel}
      </span>
      <p className="text-sm sm:text-base font-semibold text-slate-900">{stepLabel}</p>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-indigo-600" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.18em]">MVP 작동 프로세스</p>
        <h2 className="text-lg font-bold text-slate-900 truncate">{title}</h2>
      </div>
    </div>
  )
}

function StepCard({ children }: { children: React.ReactNode }) {
  return <div className="w-[420px] min-w-[420px]">{children}</div>
}

function StepBrowserFrame({
  url,
  children,
}: {
  url: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="bg-white">
        <div className="h-10 flex items-center justify-between px-3 border-b border-slate-200/80 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
          </div>
          <div className="flex-1 mx-3 bg-white rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] text-slate-600 truncate">
            {url}
          </div>
          <div className="w-16 flex justify-end">
            <span className="text-[11px] font-semibold text-indigo-600">MVP</span>
          </div>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function SpiderChart({ values }: { values: number[] }) {
  const maxRadius = 110
  const START_ANGLE = -Math.PI / 2
  return (
    <div className="relative">
      <svg viewBox="0 0 320 320" className="w-full max-w-[320px] mx-auto block">
        {[0.35, 0.65, 1].map((ratio, ringIndex) => {
          const r = maxRadius * ratio
          const points = values
            .map((_, i) => {
              const angle = START_ANGLE + (i * 2 * Math.PI) / values.length
              const x = 160 + r * Math.cos(angle)
              const y = 160 + r * Math.sin(angle)
              return `${x},${y}`
            })
            .join(' ')
          return <polygon key={ringIndex} points={points} fill="none" stroke="#E5E7EB" strokeWidth="1" />
        })}

        {values.map((_, i) => {
          const angle = START_ANGLE + (i * 2 * Math.PI) / values.length
          const x = 160 + maxRadius * Math.cos(angle)
          const y = 160 + maxRadius * Math.sin(angle)
          return <line key={i} x1={160} y1={160} x2={x} y2={y} stroke="#E5E7EB" strokeWidth="1" />
        })}

        <polygon
          points={getRadarPoints(values, maxRadius, START_ANGLE)}
          fill="#818cf8"
          fillOpacity="0.55"
          stroke="#6366f1"
          strokeWidth="2"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-28 h-28 rounded-full bg-indigo-600/10 border border-indigo-200 flex flex-col items-center justify-center">
          <div className="text-lg font-extrabold text-indigo-700 leading-none">{Math.round(values.reduce((a, b) => a + b, 0) / values.length)}%</div>
          <div className="text-[10px] text-indigo-700 font-semibold mt-1">Fit Score</div>
        </div>
      </div>
    </div>
  )
}

export default function MvpDemoPage() {
  const selectedJob = '삼성전자 서비스 기획'
  const traitValues = [88, 76, 92, 84, 80]
  const fitPercent = 88

  return (
    <div className="min-h-screen bg-[#F8FAFC] w-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.18em]">MVP 데모</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              MVP 작동 프로세스 대시보드 (Step 01 ~ Step 04)
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              예비창업패키지 사업계획서에 삽입 가능한 “실제처럼 보이는” MVP 화면 흐름입니다.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {['01', '02', '03', '04'].map((n) => (
              <span key={n} className={`px-3 py-2 rounded-xl border text-xs font-semibold ${n === '01' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                Step {n}
              </span>
            ))}
          </div>
        </div>

        {/* Steps horizontally */}
        <div className="flex gap-6 overflow-x-auto pb-4">
          {/* Step 1 */}
          <StepCard>
            <div className="mb-3">
              <p className="text-sm font-semibold text-slate-900">
                Step 01. <span className="text-indigo-600">직무 매칭</span> (Onboarding)
              </p>
              <p className="text-xs text-slate-500 mt-1">기관/사용자가 직무 공고를 선택하면 추천이 시작됩니다.</p>
            </div>
            <StepBrowserFrame url="job-ex.com/mvp-demo/onboarding">
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-indigo-50/50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      <p className="text-sm font-bold text-slate-900 truncate">선택된 직무</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-indigo-600 text-white">
                      {selectedJob}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    { title: '삼성전자 서비스 기획', tag: 'PM · 기획/전략' },
                    { title: '데이터 분석가 (DA)', tag: 'DA · 지표/가설' },
                    { title: '퍼포먼스/콘텐츠 마케팅', tag: 'Marketer · 실험/메시지' },
                  ].map((c) => {
                    const active = c.title === selectedJob
                    return (
                      <div
                        key={c.title}
                        className={`rounded-2xl border px-4 py-3 transition-all ${
                          active
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 bg-white hover:border-indigo-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900">{c.title}</p>
                            <p className="text-[11px] text-slate-500 mt-1">{c.tag}</p>
                          </div>
                          {active ? (
                            <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-0.5" />
                          ) : (
                            <span className="w-5 h-5 inline-flex rounded-full border border-slate-200" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-2">
                  <button className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-sm">
                    시뮬레이션 시작하기
                  </button>
                </div>
              </div>
            </StepBrowserFrame>
          </StepCard>

          {/* Step 2 */}
          <StepCard>
            <div className="mb-3">
              <p className="text-sm font-semibold text-slate-900">
                Step 02. <span className="text-indigo-600">실무 시뮬레이션</span> (Simulation)
              </p>
              <p className="text-xs text-slate-500 mt-1">메일 상황을 읽고 답안을 작성한 뒤 제출합니다.</p>
            </div>
            <StepBrowserFrame url="job-ex.com/mvp-demo/simulation">
              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <p className="text-sm font-bold text-slate-900">업무 메일</p>
                  </div>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p className="text-[12px] text-slate-500">[제목] CSAT 하락: 채팅 대응 속도 개선안 필요</p>
                    <p className="leading-relaxed">
                      최근 3개월간 CSAT이 하락했고, 채팅 상담 관련 불만이 증가했습니다.
                      프로세스/제품/운영 관점에서 개선안을 5~10문장으로 정리해 주세요.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-sm font-bold text-slate-900">AI 사수와 대화</p>
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-full">
                      실시간 코칭
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3 h-[250px] overflow-auto">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                          나
                        </div>
                        <div className="flex-1">
                          <div className="text-[11px] text-slate-500 mb-1">사용자</div>
                          <div className="bg-white border border-slate-200 rounded-2xl px-3 py-2 text-sm text-slate-800">
                            (답변 예시) 채팅 응답 지연이 원인일 가능성이 높다고 봅니다. 우선 응답 SLA를 기준으로 원인을
                            분류하고, 운영 측면에서는 라우팅 규칙/전담 스태프 전환을 검토하겠습니다.
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                          <Target className="w-4 h-4 text-indigo-700" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[11px] text-slate-500 mb-1 text-right">AI 사수</div>
                          <div className="bg-indigo-600 text-white rounded-2xl px-3 py-2 text-sm">
                            핵심은 “원인을 데이터로 검증”하는 부분이에요. SLA/CSAT/전환율 중
                            어떤 지표를 먼저 잡을지 한 줄로 정의해볼까요?
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button className="py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all">
                      답안 제출하기
                    </button>
                    <button className="py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all">
                      임시 저장
                    </button>
                  </div>
                </div>
              </div>
            </StepBrowserFrame>
          </StepCard>

          {/* Step 3 */}
          <StepCard>
            <div className="mb-3">
              <p className="text-sm font-semibold text-slate-900">
                Step 03. <span className="text-indigo-600">AI 실시간 피드백</span> (Monitoring)
              </p>
              <p className="text-xs text-slate-500 mt-1">답안을 기반으로 문제해결/소통 역량을 즉시 평가합니다.</p>
            </div>
            <StepBrowserFrame url="job-ex.com/mvp-demo/monitoring">
              <div className="space-y-3">
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <p className="text-sm font-bold text-slate-900 truncate">AI 분석 중…</p>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-full">
                      3초 내 결과
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    사용자의 답변을 루브릭 기준으로 채점하고, 즉시 보완 포인트와 모범 답안을 생성합니다.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <p className="text-sm font-bold text-slate-900">실시간 분석 대시보드</p>
                    <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      live
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { label: '문제 해결 능력', score: '+10', hint: '근거 연결이 좋습니다.' },
                      { label: '소통 능력', score: '보완 필요', hint: '핵심 결론을 한 문장으로 먼저 제시해 주세요.' },
                      { label: '직무 이해도', score: '+8', hint: 'CS 운영 관점의 접근이 적절합니다.' },
                      { label: '완수율', score: '+5', hint: '요구사항 범위를 잘 충족했습니다.' },
                    ].map((r) => (
                      <div key={r.label} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{r.label}</p>
                          <p className="text-xs text-slate-600 mt-1">{r.hint}</p>
                        </div>
                        <div className={`text-sm font-extrabold ${r.score.includes('+') ? 'text-indigo-700' : 'text-rose-700'}`}>
                          {r.score}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <BarChart2 className="w-4 h-4 text-indigo-600" />
                      실시간 점수 업데이트
                    </div>
                    <span className="text-[11px] text-slate-500">이후 2~3단계로 이어집니다.</span>
                  </div>
                </div>
              </div>
            </StepBrowserFrame>
          </StepCard>

          {/* Step 4 */}
          <StepCard>
            <div className="mb-3">
              <p className="text-sm font-semibold text-slate-900">
                Step 04. <span className="text-indigo-600">최종 역량 리포트</span> (Outcome)
              </p>
              <p className="text-xs text-slate-500 mt-1">종합 점수와 직무 적합도를 강조합니다.</p>
            </div>
            <StepBrowserFrame url="job-ex.com/mvp-demo/outcome">
              <div className="space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-sky-500 p-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-indigo-100 font-semibold">
                        Outcome Report
                      </p>
                      <h2 className="text-lg font-bold mt-2">직무 적합도</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-extrabold leading-none">{fitPercent}%</p>
                      <p className="text-xs text-indigo-100/90 mt-1">당신의 역량 기반</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {TRAIT_KEYS.map((k, idx) => (
                      <span
                        key={k}
                        className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-semibold"
                      >
                        {k} · {traitValues[idx]}점
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-bold text-slate-900 mb-3 text-center">Spider Chart · 역량 레이더</p>
                  <SpiderChart values={traitValues} />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-indigo-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">다음 액션 제안</p>
                      <ul className="mt-2 text-sm text-slate-700 space-y-1">
                        <li>1) 강점 영역(문제해결/직무이해)을 이력서에 키워드로 반영</li>
                        <li>2) 보완 영역(소통)을 STAR 구조로 한 번 더 정리</li>
                        <li>3) 다음 시뮬레이션에서 2~3단계 난이도로 재도전</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-sm">
                  리포트 저장하기
                </button>
              </div>
            </StepBrowserFrame>
          </StepCard>
        </div>
      </div>
    </div>
  )
}

