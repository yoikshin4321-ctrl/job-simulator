import React from 'react'

export default function TermsPage() {
  return (
    <div className="min-h-screen w-full bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-8">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.18em] mb-2">Terms of Service</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">이용약관</h1>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            본 문서는 데모/예비용 예시 문구입니다. 실제 서비스 운영 전 서비스 조건, 개인정보 처리방침, 책임 범위 등을
            법무 검토 후 확정하여 반영해 주세요.
          </p>

          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <section>
              <h2 className="font-semibold text-slate-900 mb-2">1. 서비스 제공</h2>
              <p>서비스는 사용자의 직무 시뮬레이션 목적을 위해 제공됩니다.</p>
            </section>
            <section>
              <h2 className="font-semibold text-slate-900 mb-2">2. 이용자의 의무</h2>
              <p>이용자는 관련 법령과 서비스 이용 정책을 준수해야 합니다.</p>
            </section>
            <section>
              <h2 className="font-semibold text-slate-900 mb-2">3. 책임 및 제한</h2>
              <p>서비스 이용과 관련하여 발생하는 사항에 대해 범위를 정합니다.</p>
            </section>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            문의: <a className="text-indigo-600 hover:text-indigo-700" href="mailto:support@jobsimulation.kr">support@jobsimulation.kr</a>
          </p>
        </div>
      </div>
    </div>
  )
}

