'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Brain,
  Sparkles,
  Building2,
  Banknote,
  TrendingUp,
  X,
  Target,
  BarChart3,
  Users,
  Zap,
  MessageSquare,
  Lightbulb,
  ChevronRight,
  Briefcase,
} from 'lucide-react'

const JOB_IMAGES = {
  pm: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop',
  da: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop',
  marketer: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?q=80&w=600&auto=format&fit=crop',
}

const CAREER_DATA = {
  pm: {
    name: '서비스 기획 (PM)',
    summary:
      '고객의 숨은 문제를 발견해 해결책을 설계하고, 제품의 우선순위와 비전을 결정하여 비즈니스 가치를 창출하는 중추적인 역할을 수행합니다.',
    coreValue: '문제 정의 및 해결',
    targetCompanies:
      '고객의 문제를 발견하고 이를 해결하기 위한 제품 비전과 우선순위를 결정하며, 서비스 구조 설계부터 런칭까지 비즈니스 가치를 창출하는 핵심 역할을 수행합니다.',
    personalityFit: [
      { label: '전략적 사고', value: 93, low: '실행', high: '전략' },
      { label: '소통·조율', value: 80, low: '내향', high: '소통 중심' },
      { label: '분석적 사고', value: 75, low: '직관', high: '분석' },
      { label: '리더십', value: 68, low: '수행', high: '리드' },
    ],
    coreSkills: [
      { name: '커뮤니케이션', desc: '개발·디자인·비즈니스와 원활한 소통과 조율' },
      { name: '논리적 사고', desc: '복잡한 요구사항을 쪼개고 우선순위를 정하는 능력' },
      { name: '데이터 해석력', desc: '지표와 실험 결과로 방향성 수립' },
      { name: '스테이크홀더 관리', desc: '다양한 이해관계자 기대를 조율' },
    ],
    workEnv: {
      teamCollaboration: 90,
      deadlinePressure: 75,
      autonomy: 70,
      description:
        'PM은 개발·디자인·비즈니스 등 다양한 팀과 밀접하게 협업합니다. 출시 일정과 마감 압박이 있으나, 전략 수립과 우선순위 결정에 대한 자율성이 높은 편입니다.',
    },
    salaryInsight: [
      { level: '주니어 (0~3년)', min: 3200, max: 4500 },
      { level: '미들 (4~7년)', min: 4800, max: 6500 },
      { level: '시니어 (8~12년)', min: 7000, max: 9000 },
      { level: '리드/C-Level', min: 10000, max: 10000 },
    ],
    careerPath: ['주니어 PM', '시니어 PM', '그룹 PM', '제품 책임자(CPO)', '스타트업 창업·공동창업'],
    specific: {
      title: 'PM 심층 분석',
      items: [
        {
          heading: '의사결정의 복잡성',
          body: '제한된 리소스 안에서 무엇을 먼저 만들지 결정해야 합니다. 사용자 가치, 비즈니스 임팩트, 기술 부채, 스테이크홀더 요구를 저울질하며 우선순위를 정하는 일이 핵심입니다.',
        },
        {
          heading: '제품 비전 수립',
          body: '단기 KPI뿐 아니라 1~3년 후 제품이 어떤 문제를 풀고 있을지 비전을 세우고, 로드맵으로 단계를 나누어 팀과 공유하는 역량이 필요합니다.',
        },
      ],
    },
    proQuote:
      "PM은 '제품의 미니 CEO'가 아니라, '문제를 가장 잘 정의하고 해결하는 사람'입니다. 팀원들이 목표에 집중할 수 있게 돕는 윤활유 역할이 중요해요.",
    proTip: '작은 프로젝트라도 처음부터 끝까지 기획하고 런칭해본 경험이 가장 큰 자산이 됩니다.',
  },
  da: {
    name: '데이터 분석가 (Data Analyst)',
    summary:
      '방대한 데이터 속에서 유의미한 패턴을 찾아내고, 객관적인 지표와 통계적 근거를 바탕으로 비즈니스 의사결정을 돕는 전략적 인사이트를 도출합니다.',
    coreValue: '비즈니스 인사이트 도출',
    targetCompanies:
      '방대한 데이터 속에서 비즈니스 인사이트를 발견하고, 객관적인 지표와 통계적 근거를 바탕으로 전략적 의사결정을 지원하는 전문가입니다.',
    personalityFit: [
      { label: '분석적 사고', value: 95, low: '직관', high: '분석' },
      { label: '논리·수치 감각', value: 92, low: '정성', high: '정량' },
      { label: '비즈니스 이해도', value: 80, low: '기술', high: '비즈니스' },
      { label: '호기심·탐구', value: 88, low: '루틴', high: '탐구' },
    ],
    coreSkills: [
      { name: 'SQL·Python/R', desc: '데이터 추출·분석을 위한 핵심 도구' },
      { name: '통계학 지식', desc: '가설 검증과 인과 추론의 기초' },
      { name: '비즈니스 커뮤니케이션', desc: '숫자를 비즈니스 언어로 번역해 전달' },
      { name: '문제 해결력', desc: '질문을 정의하고 데이터로 검증하는 논리적 접근' },
    ],
    workEnv: {
      teamCollaboration: 60,
      deadlinePressure: 70,
      autonomy: 75,
      description:
        '데이터 팀 내 업무 비중이 크지만, 비즈니스팀·경영진과의 리포팅·소통이 중요합니다. 데이터 분석에 집중할 수 있는 자율성이 높은 편입니다.',
    },
    salaryInsight: [
      { level: '주니어 (0~3년)', min: 3400, max: 4800 },
      { level: '미들 (4~7년)', min: 5200, max: 7500 },
      { level: '시니어 (8~12년)', min: 8000, max: 11000 },
      { level: '리드/C-Level', min: 12000, max: 12000 },
    ],
    careerPath: ['주니어 애널리스트', '시니어 애널리스트', '데이터 사이언티스트', 'BI/분석 리드', 'CDO·데이터 책임자'],
    specific: {
      title: '데이터 애널리스트 심층 분석',
      items: [
        {
          heading: '수학적 모델링',
          body: '비즈니스 질문을 측정 가능한 가설로 바꾸고, 통계·시각화·A/B 테스트로 검증합니다. 데이터 품질과 정의를 명확히 하는 것이 정확한 인사이트의 전제입니다.',
        },
        {
          heading: '비즈니스 가설 검증 프로세스',
          body: '가설 수립 → 데이터 수집·정제 → 탐색적 분석 → 시각화·리포트 → 결론 및 제안까지, 재현 가능한 파이프라인으로 일하는 것이 핵심 역량입니다.',
        },
      ],
    },
    proQuote:
      "단순히 숫자를 뽑는 것이 아니라, '숫자 뒤에 숨겨진 고객의 행동 원인'을 찾아내는 것이 핵심입니다. 기술적인 툴(Tool) 스킬은 기본이고, 비즈니스 언어로 소통하는 능력이 필요해요.",
    proTip: '실제 비즈니스 데이터를 가지고 가설을 세우고 분석해본 포트폴리오를 만드세요.',
  },
  marketer: {
    name: '마케터 (Marketer)',
    summary:
      '타겟 고객에게 브랜드 메시지를 효과적으로 전달하고, 데이터 기반의 콘텐츠 전략과 채널 최적화를 통해 고객 유입과 비즈니스 성장을 견인합니다.',
    coreValue: '고객 획득 및 전환',
    targetCompanies:
      '브랜드 메시지를 타겟 고객에게 효과적으로 전달하고, 데이터 기반의 캠페인 기획과 채널 최적화를 통해 고객 유입 및 비즈니스 성장을 견인합니다.',
    personalityFit: [
      { label: '창의성', value: 88, low: '보수', high: '창의' },
      { label: '트렌드 민감度', value: 85, low: '안정', high: '변화' },
      { label: '데이터 의사결정', value: 78, low: '감', high: '데이터' },
      { label: '소통·영향력', value: 82, low: '내향', high: '외향' },
    ],
    coreSkills: [
      { name: '퍼포먼스 마케팅 데이터 해석', desc: '전환율, ROAS 등 지표를 읽고 전략에 반영' },
      { name: '카피라이팅', desc: '타겟에 맞는 메시지와 톤으로 설득·공감' },
      { name: '트렌드 민감도', desc: '시장과 소비자 변화에 빠르게 대응' },
      { name: '프로젝트 관리', desc: '캠페인 일정·예산·협업 주체 조율' },
    ],
    workEnv: {
      teamCollaboration: 75,
      deadlinePressure: 80,
      autonomy: 65,
      description:
        '캠페인 기획·운영을 위해 다양한 부서와 협업합니다. 성과 지표에 대한 압박이 있으나, 채널·메시지에 대한 창의적 실험이 가능합니다.',
    },
    salaryInsight: [
      { level: '주니어 (0~3년)', min: 2800, max: 4000 },
      { level: '미들 (4~7년)', min: 4500, max: 6000 },
      { level: '시니어 (8~12년)', min: 6500, max: 8500 },
      { level: '리드/C-Level', min: 9500, max: 9500 },
    ],
    careerPath: ['주니어 마케터', '시니어 마케터', '마케팅 매니저', '그로스/퍼포먼스 리드', 'CMO'],
    specific: {
      title: '마케터 심층 분석',
      items: [
        {
          heading: '소비자 심리 분석',
          body: '타겟의 니즈, 페인포인트, 구매 단계별 심리를 이해하고, 메시지와 채널을 맞추는 것이 핵심입니다.',
        },
        {
          heading: '데이터 기반 성과 측정(Performance)',
          body: '광고비 대비 전환, LTV, 채널별 효율을 측정하고 A/B 테스트로 카피·랜딩을 최적화합니다.',
        },
      ],
    },
    proQuote:
      "마케팅은 '감'이 아니라 '데이터 기반의 의사결정 프로세스'입니다. 고객의 문제를 우리 서비스가 어떻게 해결해 주는지 명확하게 전달하고, 숫자로 증명해야 해요.",
    proTip: '직접 광고비를 써서 캠페인을 운영해보고 리포트를 작성해본 경험이 면접에서 강력한 무기가 됩니다.',
  },
} as const

const JOB_CARDS = [
  { id: 'pm', ...CAREER_DATA.pm },
  { id: 'da', ...CAREER_DATA.da },
  { id: 'marketer', ...CAREER_DATA.marketer },
] as const

function PersonalityBar({ label, value, low, high }: { label: string; value: number; low: string; high: string }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500 text-xs">{value}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-slate-500 mt-1">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Brain
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200/80 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-[#1E293B] text-sm sm:text-base">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function ExplorePage() {
  const [selectedId, setSelectedId] = useState<keyof typeof CAREER_DATA | null>(null)
  const job = selectedId ? CAREER_DATA[selectedId] : null

  return (
    <div className="min-h-screen bg-[#F8FAFC] w-full">
      <div className="max-w-7xl mx-auto w-full py-12 sm:py-16 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B] mb-3 text-center">
          당신에게 맞는 직무를 깊이 있게 탐색해보세요
        </h1>
        <p className="text-slate-600 text-center mb-12">
          직무 카드를 클릭하면 상세 리포트를 확인할 수 있습니다.
        </p>

        {/* 상단 직무 선택 카드 (가로 카드) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {JOB_CARDS.map((j) => (
            <button
              key={j.id}
              type="button"
              onClick={() => setSelectedId(selectedId === j.id ? null : j.id)}
              className={`text-left rounded-2xl overflow-hidden bg-white shadow-xl transition-all duration-200 ${
                selectedId === j.id
                  ? 'border-2 border-indigo-500'
                  : 'border border-slate-200 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="flex flex-col h-full">
                <img
                  src={JOB_IMAGES[j.id]}
                  alt={j.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 whitespace-normal">
                    {j.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">
                    {j.summary}
                  </p>
                  <div className="mt-auto">
                    <ChevronRight className="w-4 h-4 text-transparent mb-2" aria-hidden />{/* spacer */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">카드를 클릭해 상세 보기</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 하단 상세 섹션 */}
        {job && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row items-stretch">
              <img
                src={JOB_IMAGES[selectedId!]}
                alt={job.name}
                className="w-full sm:w-72 sm:min-h-[220px] object-cover rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none"
              />
              <div className="flex-1 px-6 py-5 border-b sm:border-b-0 sm:border-l border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-[#1E293B]">{job.name}</h2>
                  {job.coreValue && (
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-xl">
                      <Target className="w-4 h-4" />
                      {job.coreValue}
                    </span>
                  )}
                  {job.targetCompanies && (
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {job.targetCompanies}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 self-start sm:self-center"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Personality Fit */}
              <SectionCard icon={Brain} title="Personality Fit (성격 적합도)">
                <p className="text-slate-600 text-sm mb-4">
                  어떤 성향의 사람이 이 직무에서 성공하기 쉬운지 참고용으로 확인해 보세요.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {job.personalityFit.map((item, i) => (
                    <PersonalityBar
                      // eslint-disable-next-line react/no-array-index-key
                      key={i}
                      label={item.label}
                      value={item.value}
                      low={item.low}
                      high={item.high}
                    />
                  ))}
                </div>
              </SectionCard>

              {/* Core Skills */}
              <SectionCard icon={Sparkles} title="Core Skills (핵심 역량)">
                <p className="text-slate-600 text-sm mb-4">
                  현직자들이 강조하는 소프트 스킬과 핵심 역량입니다.
                </p>
                <ul className="space-y-3">
                  {job.coreSkills.map((s, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-indigo-600" />
                      </span>
                      <div>
                        <span className="font-semibold text-slate-800">{s.name}</span>
                        <p className="text-slate-600 text-sm mt-0.5">{s.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionCard>

              {/* Work Environment */}
              <SectionCard icon={Building2} title="Work Environment (업무 환경)">
                {job.workEnv?.description && (
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                    {job.workEnv.description}
                  </p>
                )}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                      <Users className="w-4 h-4 text-slate-500" />
                      팀 단위 협업 비중
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${job.workEnv?.teamCollaboration ?? 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                      <Target className="w-4 h-4 text-slate-500" />
                      마감 압박 정도
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${job.workEnv?.deadlinePressure ?? 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                      <MessageSquare className="w-4 h-4 text-slate-500" />
                      자율성 수준
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${job.workEnv?.autonomy ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Salary Insight */}
              <SectionCard icon={Banknote} title="Salary Insight (급여 상세)">
                <p className="text-slate-600 text-sm mb-1">
                  대한민국 중소/중견 기업 및 스타트업 기준, 경력 단계별 참고용 예상 연봉(단위: 만 원)입니다.
                </p>
                <p className="text-[11px] text-slate-500 mb-4">
                  * 위 금액은 기본급 기준이며, 기업 규모 및 개인의 역량에 따라 차이가 클 수 있습니다.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 font-semibold text-slate-700">경력</th>
                        <th className="text-right py-2 font-semibold text-slate-700">연봉 범위(만 원)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.salaryInsight.map((row, i) => {
                        const isTopLevel = i === job.salaryInsight.length - 1
                        const isOpenEnded = isTopLevel && row.min === row.max
                        const rangeText = isOpenEnded
                          ? `${row.min.toLocaleString()}만 원 이상`
                          : `${row.min.toLocaleString()}만 ~ ${row.max.toLocaleString()}만`
                        return (
                          // eslint-disable-next-line react/no-array-index-key
                          <tr key={i} className="border-b border-slate-100">
                            <td className="py-2.5 text-slate-700">{row.level}</td>
                            <td
                              className={`py-2.5 text-right ${
                                isTopLevel ? 'text-indigo-700 font-semibold' : 'text-slate-600'
                              }`}
                            >
                              {rangeText}
                              {isOpenEnded && (
                                <span className="block text-[11px] text-slate-500 mt-0.5">
                                  (역량 및 성과급에 따라 상한선 없음)
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              {/* Career Path */}
              <SectionCard icon={TrendingUp} title="Career Path (커리어 경로)">
                <p className="text-slate-600 text-sm mb-3">
                  이 직무 이후 성장 가능한 대표적인 커리어 경로입니다.
                </p>
                <ul className="flex flex-wrap gap-2">
                  {job.careerPath.map((path, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <li key={i} className="flex items-center gap-1 text-sm">
                      <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium">
                        {path}
                      </span>
                      {i < job.careerPath.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      )}
                    </li>
                  ))}
                </ul>
              </SectionCard>

              {/* 심층 분석 */}
              <SectionCard icon={Briefcase} title={job.specific.title}>
                <div className="space-y-4">
                  {job.specific.items.map((item, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={i}>
                      <h4 className="font-semibold text-slate-800 mb-1">{item.heading}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.body}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* 현직자의 조언 */}
              <SectionCard icon={Lightbulb} title="현직자의 한마디 / 조언">
                <div className="space-y-4">
                  <div className="relative pl-4 border-l-4 border-indigo-300 bg-indigo-50/50 rounded-r-xl py-3 pr-4">
                    <p className="text-slate-700 text-sm leading-relaxed italic">
                      &ldquo;{job.proQuote}&rdquo;
                    </p>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        취업·성장 팁
                      </span>
                      <p className="text-slate-700 text-sm leading-relaxed mt-1">{job.proTip}</p>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* CTA */}
              <SectionCard icon={BarChart3} title="이 직무 시뮬레이션 시작하기">
                <div className="pt-2">
                  <Link
                    href={`/simulation/${selectedId}`}
                    className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-sm transition-colors"
                  >
                    <BarChart3 className="w-5 h-5" />
                    이 직무 시뮬레이션 시작하기
                  </Link>
                </div>
              </SectionCard>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

