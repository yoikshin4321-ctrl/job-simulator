import React from 'react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen w-full bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-8">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.18em] mb-2">
            Privacy Policy
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">개인정보처리방침</h1>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            본 문서는 데모/예비용 예시 문구입니다. 실제 서비스 운영 시 수집 항목, 보유·이용 기간, 위탁 처리,
            권리 행사 방법 등을 법무 검토 후 확정하여 반영해 주세요.
          </p>

          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <section>
              <h2 className="font-semibold text-slate-900 mb-2">1. 개인정보의 수집 및 이용</h2>
              <p>서비스 제공과 시뮬레이션 결과 제공을 위해 최소한의 정보를 수집할 수 있습니다.</p>
            </section>
            <section>
              <h2 className="font-semibold text-slate-900 mb-2">2. 개인정보의 보관 및 이용기간</h2>
              <p>관련 법령 및 서비스 목적 달성 기간 동안 보관합니다.</p>
            </section>
            <section>
              <h2 className="font-semibold text-slate-900 mb-2">3. 안전성 확보 조치</h2>
              <p>개인정보 보호를 위해 접근 제어 및 보안 조치를 적용합니다.</p>
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

