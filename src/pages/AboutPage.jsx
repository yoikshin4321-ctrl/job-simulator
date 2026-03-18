import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] w-full">
      <section className="w-full bg-white border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          {/* 로고 & 서브타이틀 */}
          <div className="mb-10">
            <Link to="/" className="inline-flex items-baseline gap-2 group">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827] group-hover:text-indigo-600 transition-colors">
                자빅스(JOB-EX)
              </span>
              <span className="text-xs sm:text-sm text-slate-500">
                실전 직무 리허설, 자빅스(JOB-EX)
              </span>
            </Link>
          </div>

          {/* 메인 카피 */}
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight mb-3">
              직무 리허설을 통한{' '}
              <span className="text-indigo-600">실무 역량 인증</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              자빅스(JOB-EX)는 실제 기업의 업무 맥락을 반영한 실전 직무 리허설 과제를 통해,
              학생과 예비 직장인의 직무 수행 능력을 객관적으로 측정하고 인증하는
              마이크로크리덴셜 플랫폼입니다. 단순한 문제 풀이를 넘어, 실제 실무에
              가장 가까운 &quot;리허설&quot; 경험을 제공합니다.
            </p>
          </div>

          {/* 미션 & 핵심 가치 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-[#F9FAFB] rounded-2xl border border-slate-200 p-6">
              <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-2">
                Our Mission
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                자빅스(JOB-EX)의 미션은{' '}
                <span className="font-semibold">
                  학습 · 평가 · 인증 · 기회를 하나의 여정으로 연결
                </span>
                하여, 누구나 자신의 직무 역량을 증명하고 성장할 수 있도록 돕는
                것입니다. 대학과 기업, 그리고 학습자가 함께 신뢰할 수 있는
                실무 역량 인증 기준을 만들어 갑니다.
              </p>
            </div>
            <div className="bg-[#F9FAFB] rounded-2xl border border-slate-200 p-6">
              <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-2">
                For Universities & Companies
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                자빅스(JOB-EX)는 대학과 기업을 위한{' '}
                <span className="font-semibold">마이크로크리덴셜 플랫폼</span>으로,
                교육 과정에 실무 시뮬레이션을 도입하고, 결과 데이터를 기반으로
                학생의 역량을 정교하게 진단할 수 있게 합니다. 기업은 검증된
                역량 데이터를 바탕으로 보다 정교한 채용·인턴십 매칭을 진행할 수
                있습니다.
              </p>
            </div>
          </div>

          {/* 제공 서비스 리스트 */}
          <div className="mb-12">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              자빅스(JOB-EX)가 제공하는 것들
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-indigo-600 mb-1">
                  01 · 직무 리허설 시뮬레이션
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  PM, 데이터, 마케팅 등 실제 현업 과제를 바탕으로 설계된
                  &quot;직무 리허설&quot;을 통해, 실무 문해력과 문제 해결
                  능력을 평가합니다.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-indigo-600 mb-1">
                  02 · AI 기반 피드백 & 리포트
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  주관식 답안을 분석해 강점과 보완점을 제시하는 AI 피드백과,
                  성향·역량을 한눈에 보여주는 성장 리포트를 제공합니다.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold text-indigo-600 mb-1">
                  03 · 학습-평가-인증-연계
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  교과/비교과 수업, 비교과 프로그램, 기업 연계 프로젝트 등과
                  연동하여, 학습-평가-인증-기회(인턴십·채용)를 자연스럽게
                  이어줍니다.
                </p>
              </div>
            </div>
          </div>

          {/* 하단 CTA */}
          <div className="pt-8 mt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                Ready to Start
              </p>
              <p className="text-sm sm:text-base text-slate-700">
                우리 대학/조직에 자빅스(JOB-EX)를 도입하고 싶다면, 데모를 신청해 보세요.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/simulation"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-all"
              >
                시뮬레이션 체험하기
              </Link>
              <button
                type="button"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                도입 상담 문의
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

