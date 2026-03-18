import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Download, Share2, Info } from 'lucide-react'

const STORAGE_KEY = 'job_sim_ai_result'
const HISTORY_KEY = 'job_sim_ai_history'

const center = { x: 160, y: 160 }
const maxRadius = 110
// 90도(위쪽)을 시작 각도로 사용
const START_ANGLE = -Math.PI / 2

// TRAITS 순서: 12시 방향부터 시계방향
const TRAIT_KEYS = ['문제해결력', '커뮤니케이션', '직무이해력', '완수율', '전문지식']

function getRadarPoints(scores) {
  // 5각형 고정: START_ANGLE + i * 2π/5
  return scores
    .map((value, index) => {
      const angle = START_ANGLE + (index * 2 * Math.PI) / 5
      const radius = (value / 100) * maxRadius
      const x = center.x + radius * Math.cos(angle)
      const y = center.y + radius * Math.sin(angle)
      return `${x},${y}`
    })
    .join(' ')
}

export default function ResultPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showRubric, setShowRubric] = useState(false)
  const [traits, setTraits] = useState(null) // [{ key, value }]
  const [roleId, setRoleId] = useState('pm')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const historyRaw = localStorage.getItem(HISTORY_KEY)

      if (!raw && !historyRaw) {
        setIsLoading(false)
        return
      }

      let role = 'pm'
      let latestResult = {}

      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          latestResult = parsed?.result || {}
          role = parsed?.roleId || role
        } catch {
          // ignore
        }
      }

      // history에 여러 단계의 점수가 쌓여 있다면, 평균값을 구해 사용
      const aggregate = {}
      let count = 0

      if (historyRaw) {
        try {
          const history = JSON.parse(historyRaw) || []
          history.forEach((entry) => {
            const r = entry.result || {}
            TRAIT_KEYS.forEach((k) => {
              const info = r[k]
              const score = info?.score ?? info?.점수
              if (typeof score === 'number') {
                if (!aggregate[k]) aggregate[k] = { sum: 0, n: 0 }
                aggregate[k].sum += score
                aggregate[k].n += 1
                count += 1
              }
            })
          })
        } catch {
          // ignore
        }
      }

      // history가 있으면 평균값 사용, 없으면 최신 결과 사용
      const mapped = TRAIT_KEYS.map((key) => {
        const agg = aggregate[key]
        if (agg && agg.n > 0) {
          return { key, value: Math.round(agg.sum / agg.n) }
        }
        const info = latestResult[key]
        const score = info?.score ?? info?.점수 ?? 0
        return { key, value: score }
      })

      setTraits(mapped)
      setRoleId(role)
    } catch {
      setTraits(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] w-full flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl shadow-slate-900/60">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl border border-indigo-500/60 bg-indigo-500/10 flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm sm:text-base font-semibold text-slate-50 mb-2">
            AI가 신님의 수행 결과와 산출물을 분석 중입니다...
          </p>
          <p className="text-xs sm:text-sm text-slate-400">
            작성하신 답변, 선택한 전략, 데이터 해석 방식까지 종합하여 준비도 리포트를 구성하고 있어요.
          </p>
        </div>
      </div>
    )
  }

  const hasData = traits && traits.some((t) => typeof t.value === 'number' && t.value > 0)

  if (!hasData) {
    let devError = ''
    try {
      const raw = localStorage.getItem('job_sim_ai_result_error')
      if (raw) {
        const parsed = JSON.parse(raw)
        devError = parsed?.message || ''
      }
    } catch {
      devError = ''
    }

    return (
      <div className="min-h-screen bg-[#020617] w-full flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-2xl shadow-slate-900/60">
          <p className="text-sm sm:text-base font-semibold text-slate-50 mb-2">
            AI 분석 결과를 불러올 수 없습니다.
          </p>
          <p className="text-xs sm:text-sm text-slate-400 mb-2">
            시뮬레이션을 다시 완료하거나, OpenAI API 키 설정을 확인한 뒤 다시 시도해 주세요.
          </p>
          {devError && (
            <p className="text-[10px] text-rose-300 mb-3 whitespace-pre-wrap">
              (개발용 디버그 메시지) {devError}
            </p>
          )}
          <Link
            to="/simulation"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-all"
          >
            시뮬레이션 다시 진행하기
          </Link>
        </div>
      </div>
    )
  }

  const avgScore =
    traits.reduce((sum, t) => sum + (typeof t.value === 'number' ? t.value : 0), 0) /
    traits.length || 0

  const interestLabel =
    roleId === 'da'
      ? '데이터 분석'
      : roleId === 'marketer'
      ? '마케팅'
      : 'PM'

  return (
    <div className="min-h-screen bg-[#0F172A] w-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-[#020617] rounded-3xl border border-slate-800 shadow-2xl shadow-indigo-900/40 overflow-hidden">
        {/* 상단 헤더 */}
        <div className="px-6 sm:px-10 pt-8 pb-6 border-b border-slate-800 bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-950">
          <p className="text-[11px] font-semibold text-indigo-300 uppercase tracking-[0.25em] mb-2">
            Result Report
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold !text-white mb-1">
                {interestLabel} 실무 준비도 · 결과 리포트
              </h1>
              <p className="text-xs sm:text-sm text-white/80">
                이번 직무 리허설을 기반으로, 문제 해결력·커뮤니케이션·직무 이해도 등 핵심 역량을
                정량적으로 분석했습니다.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] text-white/80">종합 준비도</p>
                <p className="text-2xl font-extrabold text-white leading-tight">
                  {Math.round(avgScore)}점
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/60 flex items-center justify-center">
                <Award className="w-6 h-6 text-indigo-300" />
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="px-6 sm:px-10 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 중앙: 육각형 레이더 차트 (실제 값은 5개라 5각형이지만, 개념적으로 육각형 스타일) */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold !text-slate-300">
                  역량 레이더 · Personality Fit
                </h2>
                <button
                  type="button"
                  onClick={() => setShowRubric(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-slate-700 bg-slate-900/60 text-[10px] sm:text-xs text-slate-200 hover:border-indigo-400 hover:text-indigo-300 hover:bg-slate-900 transition-all"
                >
                  <Info className="w-3 h-3" />
                  평가 루브릭 확인
                </button>
              </div>
              <div className="relative flex items-center justify-center">
                <svg viewBox="0 0 320 320" className="w-full max-w-md">
                  {/* 그리드 폴리곤 */}
                  {[0.35, 0.65, 1].map((ratio, ringIndex) => {
                    const r = maxRadius * ratio
                    const points = traits.map((_, index) => {
                      const angle = START_ANGLE + (index * 2 * Math.PI) / 5
                      const x = center.x + r * Math.cos(angle)
                      const y = center.y + r * Math.sin(angle)
                      return `${x},${y}`
                    }).join(' ')
                    return (
                      <polygon
                        // eslint-disable-next-line react/no-array-index-key
                        key={ringIndex}
                        points={points}
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="1"
                      />
                    )
                  })}

                  {/* 축 라인 */}
                  {traits.map((_, index) => {
                    const angle = START_ANGLE + (index * 2 * Math.PI) / 5
                    const x = center.x + maxRadius * Math.cos(angle)
                    const y = center.y + maxRadius * Math.sin(angle)
                    return (
                      <line
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        x1={center.x}
                        y1={center.y}
                        x2={x}
                        y2={y}
                        stroke="#E5E7EB"
                        strokeWidth="1"
                      />
                    )
                  })}

                  {/* 실제 데이터 레이더 영역 */}
                  <polygon
                    points={getRadarPoints(traits.map((t) => t.value))}
                    fill="#818cf8"
                    fillOpacity="0.5"
                    stroke="#818cf8"
                    strokeWidth="2"
                  />
                </svg>

                {/* 라벨 전용 부모 컨테이너: 중심을 (0,0)로 고정 */}
                <div
                  className="absolute w-0 h-0"
                  style={{ left: '50%', top: '50%' }}
                >
                  {traits.map((trait, index) => {
                    // 그래프 점(Point)과 동일한 각도 공식 사용: START_ANGLE + i * 2π/5
                    const angle = START_ANGLE + (index * 2 * Math.PI) / 5
                    const labelR = maxRadius + 80
                    const x = labelR * Math.cos(angle)
                    const y = labelR * Math.sin(angle)
                    return (
                      <div
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        className="absolute flex flex-col items-center text-center gap-1 text-base sm:text-lg text-white font-semibold drop-shadow-md"
                        style={{
                          left: `${x}px`,
                          top: `${y}px`,
                          transform: 'translate(-50%, -50%)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span className="block">{trait.key}</span>
                        <span className="block font-semibold text-pink-300">
                          {trait.value}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 우측: 마이크로크리덴셜 인증 배지 + 설명 */}
          <div className="flex flex-col gap-5">
              <div className="relative bg-gradient-to-br from-indigo-700 via-indigo-500 to-sky-400 rounded-2xl p-4 sm:p-5 text-white shadow-xl overflow-hidden">
              <div className="absolute -top-8 -right-6 w-24 h-24 bg-indigo-300/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 left-0 w-32 h-32 bg-sky-300/20 rounded-full blur-3xl" />

              <div className="relative flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-900/40 flex items-center justify-center animate-pulse">
                  <Award className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-indigo-100">
                    Micro-Credential
                  </p>
                  <h2 className="text-sm sm:text-base font-semibold text-white">
                    PM 실무 준비도 인증 배지 수여
                  </h2>
                </div>
              </div>

              <p className="relative text-xs sm:text-sm text-white leading-relaxed mb-3">
                이번 시뮬레이션 결과는 Rehearsal의 마이크로크리덴셜 기준을 충족하여,
                &quot;PM 실무 준비도&quot; 인증 배지가 부여되었습니다. 해당 배지는 이력서·포트폴리오에
                첨부해 실무 역량을 증명할 수 있습니다.
              </p>

              <div className="relative mt-2 flex items-center gap-2 text-[10px] text-indigo-100/80">
                <span className="inline-flex px-2 py-1 rounded-full bg-slate-900/40 border border-indigo-200/30">
                  • 인증 기준: 문제 해결력 80점 이상, 직무 이해도 80점 이상
                </span>
              </div>
            </div>

            {/* 공유/저장 영역 */}
            <div className="bg-slate-900/70 rounded-2xl border border-slate-800 p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-white mb-3">결과 저장 및 활용</h3>
              <p className="text-[11px] sm:text-xs text-white/80 mb-4">
                리포트를 PDF로 저장하거나, 이력서·포트폴리오에 인증 배지를 추가해 실무 준비도를
                보여주세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => alert('PDF 다운로드 기능은 추후 버전에서 제공될 예정입니다.')}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 text-slate-900 text-xs sm:text-sm font-semibold hover:bg-white hover:shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  PDF로 결과 리포트 다운로드
                </button>
                <button
                  type="button"
                  onClick={() => alert('이력서에 추가할 수 있는 배지 링크를 복사했습니다.')}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 hover:shadow-md transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  이력서에 배지 추가하기
                </button>
              </div>
            </div>

            <div className="mt-auto text-right">
              <Link
                to="/simulation"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 text-[11px] sm:text-xs text-slate-300 hover:bg-slate-800 hover:border-slate-500 transition-all"
              >
                다른 직무 시뮬레이션 도전하기
              </Link>
            </div>
          </div>
        </div>

        {/* 나의 수행 산출물 섹션 */}
        <div className="px-6 sm:px-10 pb-8">
          <div className="bg-slate-900/70 border-t border-slate-800/80 rounded-3xl mt-2 p-6 sm:p-7">
            <h3 className="text-sm font-semibold text-white mb-3">나의 수행 산출물</h3>
            <p className="text-[11px] sm:text-xs text-white/80 mb-4">
              이번 시뮬레이션에서 작성된 기획안과 분석 노트를 모아두었습니다. 필요할 때 포트폴리오에
              활용해 보세요.
            </p>
            <div className="space-y-2">
              {[
                { name: '시뮬레이션 중 작성된 기획안.pdf', size: '1.2MB', type: '기획안' },
                { name: '데이터 분석 메모.md', size: '320KB', type: '분석 노트' },
                { name: '발표용 슬라이드 초안.pptx', size: '3.4MB', type: '슬라이드' },
              ].map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-indigo-400/70 hover:bg-slate-800/80 transition-all text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-[10px] text-indigo-200 font-semibold">
                      {file.type}
                    </div>
                    <div>
                      <p className="text-white truncate max-w-[180px] sm:max-w-[260px]">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-white/70">{file.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-2 py-1 rounded-lg border border-slate-600 text-[10px] text-slate-200 hover:bg-slate-700 hover:border-slate-400 transition-all"
                    onClick={() => alert('데모 버전에서는 샘플 파일만 제공됩니다.')}
                  >
                    열기
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 평가 루브릭 모달 */}
      {showRubric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-700 rounded-2xl p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm sm:text-base font-semibold text-slate-50 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                평가 루브릭 · 점수 기준
              </h2>
              <button
                type="button"
                onClick={() => setShowRubric(false)}
                className="text-[11px] text-slate-400 hover:text-slate-100 transition-colors"
              >
                닫기
              </button>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mb-3">
              각 항목은 0~100점 사이로 평가되며, Rehearsal의 직무별 전문가 패널과 AI 평가 모델이
              함께 기준을 정의했습니다.
            </p>
            <div className="space-y-3 text-[11px] sm:text-xs text-slate-200">
              <div>
                <p className="font-semibold text-indigo-300 mb-0.5">문제 해결력</p>
                <p className="text-slate-400">
                  문제를 어떻게 정의했는지, 가설 수립과 우선순위 설정이 논리적인지, 제안한 솔루션이
                  현실적인 제약을 고려하는지 평가합니다.
                </p>
              </div>
              <div>
                <p className="font-semibold text-indigo-300 mb-0.5">커뮤니케이션</p>
                <p className="text-slate-400">
                  자신의 생각을 구조화하여 전달하는지, 이해관계자 관점을 고려해 설명하는지, 글의
                  명료성과 설득력을 중심으로 채점합니다.
                </p>
              </div>
              <div>
                <p className="font-semibold text-indigo-300 mb-0.5">직무 이해도</p>
                <p className="text-slate-400">
                  해당 직무에서 실제로 사용하는 개념·용어를 적절히 활용하는지, 역할과 책임에 대한
                  이해가 답변에 드러나는지를 평가합니다.
                </p>
              </div>
              <div>
                <p className="font-semibold text-indigo-300 mb-0.5">과제 완수율</p>
                <p className="text-slate-400">
                  제시된 요구사항을 얼마나 빠짐없이 충족했는지, 질문에 대한 답변 범위가 충분한지,
                  마감 시간과 형식을 잘 지켰는지를 종합적으로 점수화합니다.
                </p>
              </div>
              <div>
                <p className="font-semibold text-indigo-300 mb-0.5">전문 지식</p>
                <p className="text-slate-400">
                  업계 사례, 데이터 활용, 프레임워크 등 전문적인 인사이트가 포함되어 있는지, 피상적인
                  설명을 넘어 구체적인 실행 가능 아이디어가 있는지를 평가합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

