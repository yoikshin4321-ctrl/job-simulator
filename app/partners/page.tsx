'use client'

import Link from 'next/link'

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] w-full">
      <section className="w-full bg-white border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 space-y-12">
          {/* Hero */}
          <header className="space-y-4">
            <p className="text-xs sm:text-sm font-semibold text-indigo-600 uppercase tracking-[0.18em]">
              For Universities & Companies
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
              대학·기업을 위한 <span className="text-indigo-600">실무 역량 데이터 플랫폼</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              자빅스(JOB-EX)는 실전 직무 리허설 데이터를 기반으로 학생·지원자의 실무 역량을 정교하게 측정하고,
              채용·인턴십·교육 프로그램의 성과를 한눈에 볼 수 있게 돕는 마이크로크리덴셜 플랫폼입니다.
            </p>
          </header>

          {/* Why JOB-EX */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="rounded-2xl border border-slate-200 bg-[#F9FAFB] p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-indigo-600 mb-2">
                01 · 실전 과제 기반 역량 진단
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                PM, 데이터, 마케팅 등 실제 기업 과제를 그대로 변형한 리허설을 통해, 지원자의 문제 정의력·데이터 해석력·
                커뮤니케이션 능력을 단순 점수 이상의 정성 데이터로 확인할 수 있습니다.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#F9FAFB] p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-indigo-600 mb-2">
                02 · AI 기반 루브릭 평가 & 리포트
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                사전에 설계된 루브릭과 AI 평가를 결합해, 문제해결력·직무이해력 등 5개 핵심 역량을 점수와 서술형 피드백으로
                제공합니다. 대학·기업은 동일 기준으로 여러 기수를 비교할 수 있습니다.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#F9FAFB] p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-indigo-600 mb-2">
                03 · 채용·인턴십 매칭에 바로 쓰이는 데이터
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                단순 출석·완료 여부가 아닌, 실제 과제 수행 기록과 역량 지표를 바탕으로 인턴·채용 후보를 선별할 수 있어
                현업팀과 HR 모두 만족하는 매칭이 가능합니다.
              </p>
            </div>
          </section>

          {/* For Universities / For Companies */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-[#F9FAFB] p-6 space-y-3">
              <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-widest">
                For Universities
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                비교과 프로그램, 캡스톤·전공 수업, 취업 교과와 연계하여 학생들의 직무 준비도를 데이터로 관리할 수 있습니다.
                각 학생의 강점·보완점 리포트를 바탕으로 진로 상담과 후속 교육 콘텐츠를 설계할 수 있습니다.
              </p>
              <ul className="text-xs sm:text-sm text-slate-700 list-disc list-inside space-y-1">
                <li>학교·단과대·학과별 참여 현황 및 역량 분포 대시보드</li>
                <li>학습-평가-인증-기회(인턴십·채용) 연계 설계 지원</li>
                <li>성과 보고용 PDF 리포트 및 익명 통계 데이터 제공</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#F9FAFB] p-6 space-y-3">
              <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-widest">
                For Companies
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                공채·인턴·채용 연계형 프로그램에서 지원자의 실무 수행 능력을 정량·정성 데이터로 확인하고, 조직이
                실제로 필요로 하는 역량에 맞는 인재를 선발할 수 있습니다.
              </p>
              <ul className="text-xs sm:text-sm text-slate-700 list-disc list-inside space-y-1">
                <li>직무별 커스텀 과제 설계 및 AI 루브릭 세팅 컨설팅</li>
                <li>지원자별 실무 리허설 결과를 한 번에 비교하는 기업용 대시보드</li>
                <li>우수 인재 풀 관리 및 차기 전형 초청 기능(추가 개발 예정)</li>
              </ul>
            </div>
          </section>

          {/* Why us bullets */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">왜 자빅스(JOB-EX)를 선택해야 할까요?</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
              <li className="rounded-2xl border border-slate-200 bg-white p-4">
                <span className="font-semibold text-slate-900">실제 업무에 가까운 시나리오</span>
                <br />
                단순 객관식·OX가 아닌, 실제 현업에서 마주치는 상황을 바탕으로 설계된 서술형 과제를 제공합니다.
              </li>
              <li className="rounded-2xl border border-slate-200 bg-white p-4">
                <span className="font-semibold text-slate-900">AI + 전문가 기준의 이중 평가</span>
                <br />
                AI 평가를 기반으로 하되, 필요 시 내부 평가자 기준을 함께 반영할 수 있도록 설계되어 있습니다.
              </li>
              <li className="rounded-2xl border border-slate-200 bg-white p-4">
                <span className="font-semibold text-slate-900">도입이 쉬운 SaaS 형태</span>
                <br />
                별도 설치 없이 브라우저 기반으로 바로 사용할 수 있고, 학교·기업 계정 단위로 손쉽게 관리 가능합니다.
              </li>
              <li className="rounded-2xl border border-slate-200 bg-white p-4">
                <span className="font-semibold text-slate-900">학생·지원자에게도 의미 있는 경험</span>
                <br />
                단순 평가를 넘어, 피드백과 모범 답안을 통해 자기 이해와 역량 성장을 돕는 학습 경험을 제공합니다.
              </li>
            </ul>
          </section>

          {/* Contact CTA */}
          <section className="pt-8 mt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                Partnership & Demo
              </p>
              <p className="text-sm sm:text-base text-slate-700">
                자빅스(JOB-EX)를 대학 커리큘럼이나 기업 채용/인턴십 전형에 도입하고 싶다면, 아래 메일로 문의해 주세요.
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                컨택 이메일:{' '}
                <a href="mailto:job-ex@gmail.com" className="text-indigo-600 hover:text-indigo-700 underline">
                  job-ex@gmail.com
                </a>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href="mailto:job-ex@gmail.com?subject=JOB-EX%20대학·기업용%20서비스%20도입%20문의"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-all"
              >
                데모·도입 상담 메일 보내기
              </a>
              <Link
                href="/simulation"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                시뮬레이션 화면 먼저 둘러보기
              </Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

