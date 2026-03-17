import { Link } from 'react-router-dom'
import { Clock, ArrowRight } from 'lucide-react'

const JOB_IMAGES = {
  pm: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600',
  data: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600',
  marketing: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?q=80&w=600',
}

const SIMULATION_CARDS = [
  {
    id: 'pm',
    tag: 'PM (Product Manager)',
    title: '고객 문의 데이터 기반 채팅 기능 도입 우선순위 및 MVP 설계',
    description:
      '상황: 최근 3개월간 고객센터 문의 중 채팅 관련 문의 비중이 8%→21%로 증가했고, 앱 리뷰에도 “실시간 응대 부족” 피드백이 반복되고 있습니다. 개발 리소스는 한 분기당 2개 스쿼드, 스프린트 4회로 제한되어 있습니다.\n\n데이터/지표: 문의 유형별 티켓 수, FAQ 조회수, NPS/CSAT 지표, 앱 리뷰 키워드 분석 결과가 주어졌다고 가정합니다.\n\n당면 과제: 위 상황과 데이터를 바탕으로 채팅 기능 도입 필요성을 평가하고, 다른 요구사항(예: 마이페이지 개선, 추천 알고리즘 고도화 등)과 비교하여 채팅 기능의 우선순위를 정의한 뒤, 최소 기능(MVP) 백로그를 설계해 주세요.',
    duration: '약 30분',
  },
  {
    id: 'data',
    tag: '데이터 애널리스트 (Data Analyst)',
    title: '주간 결제 완료율 10% 하락 원인 분석 및 핵심 지표 대시보드 설계',
    description:
      '상황: 커머스 서비스의 최근 4주 결제 완료율이 10%p 이상 하락했고, 특히 모바일 웹 채널에서 이탈이 두드러집니다. 마케팅·개발·운영팀이 동시에 다양한 원인을 제기하고 있어, 의사결정이 지연되고 있습니다.\n\n데이터/지표: 퍼널별 전환율(랜딩→상품 상세→장바구니→결제 시도→결제 완료), 채널별 트래픽/전환, 프로모션 캠페인 집행 이력, 장애 로그가 있다고 가정합니다.\n\n당면 과제: 위 데이터를 활용해 가능한 원인 가설을 2~3개 도출하고, 각 가설을 검증하기 위한 분석 방법을 설계한 뒤, 경영진이 주간 회의에서 볼 수 있는 핵심 지표 대시보드 구성을 제안해 주세요.',
    duration: '약 30분',
  },
  {
    id: 'marketing',
    tag: '마케터 (Marketer)',
    title: '20대 대학생 타겟 무선 이어폰 런칭 캠페인 설계 및 성과 지표 정의',
    description:
      '상황: 20대 대학생을 주요 타겟으로 한 무선 이어폰 신제품이 2개월 뒤 출시될 예정입니다. 경쟁사는 이미 유튜브·인스타그램·검색광고를 적극 활용하고 있으며, 우리 브랜드는 해당 타겟 인지도와 선호도에서 밀려 있는 상황입니다.\n\n데이터/지표: 지난 1년간 채널별 유입·전환 데이터, 타겟 페르소나 인터뷰 요약, 경쟁사 캠페인 벤치마크 자료가 있다고 가정합니다.\n\n당면 과제: 위 상황과 데이터를 기반으로 핵심 타겟 페르소나를 정의하고, 인스타그램·유튜브·검색광고 각각에 적합한 메시지/크리에이티브 방향을 설계한 뒤, 캠페인 성과를 측정하기 위한 주요 지표(KPI)와 간단한 실험(AB 테스트) 구조를 제안해 주세요.',
    duration: '약 30분',
  },
]

export default function SimulationPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] w-full">
      <section className="bg-gradient-to-b from-white to-[#F8FAFC] border-b border-slate-200/60 py-12 sm:py-16 w-full">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B] tracking-tight mb-3">
            도전하고 싶은 직무를 선택하세요
          </h1>
          <p className="text-slate-600">
            실무 과제를 수행하고 AI 피드백으로 역량을 점검해 보세요.
          </p>
          </div>
        </div>
      </section>

      <section className="w-full">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {SIMULATION_CARDS.map((card) => (
              <article
                key={card.id}
                className="flex flex-col h-full bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200/80 hover:shadow-md hover:border-slate-200 transition-all"
              >
                <img
                  src={JOB_IMAGES[card.id]}
                  alt={card.tag}
                  className="w-full h-40 object-cover flex-shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between p-6">
                  {/* 중간: 직무 타이틀 + 과제 제목만 */}
                  <div className="space-y-2">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-xl">
                      {card.tag}
                    </span>
                    <h2 className="text-base font-bold text-[#1E293B] leading-snug">
                      {card.title}
                    </h2>
                  </div>

                  {/* 하단: 소요 시간 + 버튼 */}
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{card.duration}</span>
                    </div>
                    <Link
                      to={`/simulation/${card.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white text-sm font-semibold rounded-2xl hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      과제 수행하기
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
