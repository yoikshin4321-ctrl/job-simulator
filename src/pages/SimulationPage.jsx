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
    title: "고객 문의 데이터 분석을 통한 '채팅 기능' 도입 우선순위 결정 및 MVP 백로그 작성",
    description: '고객 문의·데이터를 근거로 우선순위를 제시하고, MVP 백로그를 작성하는 실무. (근거 제시 필수)',
    duration: '약 30분',
  },
  {
    id: 'data',
    tag: '데이터 애널리스트 (Data Analyst)',
    title: '최근 주간 결제 완료율 10% 하락 원인 분석을 위한 가설 수립 및 핵심 지표 대시보드 기획',
    description: '비즈니스 임팩트를 고려한 가설 수립 및 대시보드 기획 실무.',
    duration: '약 30분',
  },
  {
    id: 'marketing',
    tag: '마케터 (Marketer)',
    title: "20대 대학생 타겟 '무선 이어폰' 런칭 광고 캠페인 페르소나 정의 및 채널별 카피 기획",
    description: '타겟 페르소나 정의와 채널별 카피 기획. (성과 측정 지표 포함 필수)',
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
                  <div>
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-xl mb-3">
                      {card.tag}
                    </span>
                    <h2 className="text-lg font-bold text-[#1E293B] mb-2">{card.title}</h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      {card.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{card.duration}</span>
                    </div>
                  </div>
                  <Link
                    to={`/simulation/${card.id}`}
                    className="w-full mt-4 inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white text-sm font-semibold rounded-2xl hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    과제 수행하기
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
