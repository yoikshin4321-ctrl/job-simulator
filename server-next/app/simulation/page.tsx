export const dynamic = 'force-dynamic'

export default function SimulationPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/70">
        <p className="text-xs font-semibold text-indigo-300 uppercase tracking-[0.18em] mb-3">
          JOB-EX Simulation
        </p>
        <h1 className="text-2xl font-bold text-white mb-3">
          /simulation 경로가 준비되었습니다.
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          이 Next.js 인스턴스는 자빅스(JOB-EX)의 API와 기본 페이지를 제공하고 있으며,
          프론트엔드 실제 시뮬레이션 화면은 Vite 기반 클라이언트 앱에서 렌더링됩니다.
        </p>
        <p className="text-sm text-slate-400 leading-relaxed">
          지금 이 페이지는 Vercel 배포 환경에서 <code className="px-1.5 py-0.5 rounded-md bg-slate-800 text-xs">
            /simulation
          </code>{' '}
          경로가 <span className="font-semibold text-indigo-300">NOT_FOUND</span> 에러 없이
          정상적으로 인식되는지 확인하기 위한 플레이스홀더입니다. 필요하다면 이후에 이
          위치에 실제 시뮬레이션 UI를 옮겨올 수 있습니다.
        </p>
      </div>
    </main>
  )
}

