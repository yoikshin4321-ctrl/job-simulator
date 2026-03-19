/* 
 * /simulation 인덱스 페이지
 * - Vercel에서는 바로 실제 시뮬레이션 화면(예: PM 직무)으로 보내고 싶은 요구가 많아서
 * - 이 페이지에서 /simulation/pm 으로 즉시 리다이렉트합니다.
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SimulationIndexPage() {
  const router = useRouter()

  useEffect(() => {
    // 기본 실습 직무: PM
    router.replace('/simulation/pm')
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="max-w-md w-full text-center space-y-3">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.18em]">
          JOB-EX Simulation
        </p>
        <h1 className="text-lg font-bold text-slate-900">시뮬레이션으로 이동 중입니다…</h1>
        <p className="text-sm text-slate-600">
          잠시만 기다려 주세요. PM 직무 기준 첫 번째 시뮬레이션 단계로 바로 이동합니다.
        </p>
      </div>
    </main>
  )
}
