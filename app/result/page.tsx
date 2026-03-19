'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Award, Briefcase, Download, Share2, Info } from 'lucide-react'
import { suggestMatchingJobPostingsWithOpenAI } from '../../src/api/openai'

const STORAGE_KEY = 'job_sim_ai_result'
const HISTORY_KEY = 'job_sim_ai_history'

const center = { x: 160, y: 160 }
const maxRadius = 110
// 90도(위쪽)을 시작 각도로 사용
const START_ANGLE = -Math.PI / 2

// TRAITS 순서: 12시 방향부터 시계방향
const TRAIT_KEYS = ['문제해결력', '커뮤니케이션', '직무이해력', '완수율', '전문지식'] as const

function getRadarPoints(scores: number[]) {
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

type TraitKey = (typeof TRAIT_KEYS)[number]

interface TraitScore {
  key: TraitKey
  value: number
}

interface StoredResult {
  roleId?: 'pm' | 'da' | 'marketer' | string
  result?: Record<
    TraitKey,
    {
      score?: number
      점수?: number
    }
  >
}

interface HistoryEntry {
  result?: StoredResult['result']
}

type JobMatch = {
  title: string
  orgType?: string
  location?: string
  employmentType?: string
  whyMatch?: string
}

function getFallbackJobMatches(roleId: 'pm' | 'da' | 'marketer', traits: TraitScore[]): JobMatch[] {
  const sorted = [...traits].sort((a, b) => b.value - a.value)
  const top = sorted[0]?.key ?? '문제해결력'

  if (roleId === 'da') {
    return [
      {
        title: '주니어 데이터 애널리스트',
        orgType: 'IT·커머스 스타트업',
        location: '서울 (재택 병행 가능)',
        employmentType: '정규직',
        whyMatch: `${top} 점수 패턴을 바탕으로, 퍼널·지표 해석이 필요한 애널리스트 포지션과 잘 맞습니다.`,
      },
      {
        title: 'BI/리포팅 담당자',
        orgType: '중견 서비스 기업',
        location: '경기·서울',
        employmentType: '정규직',
        whyMatch: '데이터 정리와 경영진 리포팅 역량이 강조되는 역할로, 시뮬레이션에서 드러난 분석 습관과 연결됩니다.',
      },
      {
        title: '그로스/실험 분석 코ordinator',
        orgType: '모바일 앱 스타트업',
        location: '서울',
        employmentType: '계약직 → 정규직 전환',
        whyMatch: '가설·실험 설계 경험이 있다면 A/B 테스트와 지표 모니터링 직무로 이어지기 좋습니다.',
      },
      {
        title: '데이터 기획(현업-DA 협업)',
        orgType: '에듀테크·핀테크',
        location: '서울',
        employmentType: '정규직',
        whyMatch: 'SQL·지표 정의와 기획 간 번역 역할을 동시에 요구하는 포지션입니다.',
      },
    ]
  }
  if (roleId === 'marketer') {
    return [
      {
        title: '퍼포먼스 마케터',
        orgType: 'D2C·이커머스',
        location: '서울',
        employmentType: '정규직',
        whyMatch: `${top} 역량이 높다면 성과 기반 캠페인 운영·최적화 직무와 궁합이 좋습니다.`,
      },
      {
        title: '콘텐츠 마케터',
        orgType: 'B2B SaaS',
        location: '서울 (주 2일 재택)',
        employmentType: '정규직',
        whyMatch: '메시지 설계와 채널 이해가 필요한 역할로, 시뮬레이션 과제와 방향이 맞습니다.',
      },
      {
        title: '그로스 마케터',
        orgType: 'IT 스타트업',
        location: '서울',
        employmentType: '정규직',
        whyMatch: '실험·지표 기반 의사결정을 선호한다면 단계별 성장을 담당하는 포지션을 검토해 보세요.',
      },
      {
        title: '브랜드 마케터',
        orgType: '대기업 계열 디지털 조직',
        location: '서울',
        employmentType: '정규직',
        whyMatch: '스토리텔링과 톤앤매너 정합성이 중요한 브랜드 빌딩 역할과 연결됩니다.',
      },
    ]
  }
  return [
    {
      title: '서비스 기획자 (PM)',
      orgType: 'IT·플랫폼 스타트업',
      location: '서울',
      employmentType: '정규직',
      whyMatch: `${top} 역량이 두드러질 경우 우선순위·문제 정의 중심의 PM 롤과 잘 맞습니다.`,
    },
    {
      title: '프로덕트 오너(PO)',
      orgType: '에듀테크·핀테크',
      location: '서울',
      employmentType: '정규직',
      whyMatch: '요구사항 정리와 스프린트 단위 실행이 강점이라면 PO 트랙을 함께 보세요.',
    },
    {
      title: '전략·기획 (신사업/서비스)',
      orgType: '중견 기업 디지털 TF',
      location: '수도권',
      employmentType: '정규직',
      whyMatch: '비즈니스 맥락과 이해관계자 조율이 강점이면 전략 기획 포지션도 적합합니다.',
    },
    {
      title: 'CX/운영 기획',
      orgType: '커머스·라이프스타일 앱',
      location: '서울',
      employmentType: '계약직',
      whyMatch: '사용자 경험과 운영 이슈를 동시에 다루는 역할로 진입 장벽이 상대적으로 낮은 편입니다.',
    },
  ]
}

export default function ResultPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showRubric, setShowRubric] = useState(false)
  const [traits, setTraits] = useState<TraitScore[] | null>(null)
  const [roleId, setRoleId] = useState<'pm' | 'da' | 'marketer'>('pm')
  const [jobMatches, setJobMatches] = useState<JobMatch[] | null>(null)
  const [jobsLoading, setJobsLoading] = useState(false)

  useEffect(() => {
    try {
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      const raw = window.localStorage.getItem(STORAGE_KEY)
      const historyRaw = window.localStorage.getItem(HISTORY_KEY)

      if (!raw && !historyRaw) {
        setIsLoading(false)
        return
      }

      let role: 'pm' | 'da' | 'marketer' = 'pm'
      let latestResult: StoredResult['result'] = {}

      if (raw) {
        try {
          const parsed: StoredResult = JSON.parse(raw)
          latestResult = parsed?.result || {}
          const r = parsed?.roleId
          if (r === 'pm' || r === 'da' || r === 'marketer') {
            role = r
          }
        } catch {
          // ignore
        }
      }

      // history에 여러 단계의 점수가 쌓여 있다면, 평균값을 구해 사용
      const aggregate: Record<TraitKey, { sum: number; n: number }> = {} as any

      if (historyRaw) {
        try {
          const history: HistoryEntry[] = JSON.parse(historyRaw) || []
          history.forEach((entry) => {
            const r = entry.result || {}
            TRAIT_KEYS.forEach((k) => {
              const info = (r as any)[k]
              const score = info?.score ?? info?.점수
              if (typeof score === 'number') {
                if (!aggregate[k]) aggregate[k] = { sum: 0, n: 0 }
                aggregate[k].sum += score
                aggregate[k].n += 1
              }
            })
          })
        } catch {
          // ignore
        }
      }

      // history가 있으면 평균값 사용, 없으면 최신 결과 사용
      const mapped: TraitScore[] = TRAIT_KEYS.map((key) => {
        const agg = aggregate[key]
        if (agg && agg.n > 0) {
          return { key, value: Math.round(agg.sum / agg.n) }
        }
        const info = (latestResult as any)?.[key]
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

  useEffect(() => {
    if (!traits || !traits.some((t) => typeof t.value === 'number' && t.value > 0)) return

    let cancelled = false
    ;(async () => {
      setJobsLoading(true)
      try {
        const traitsText = traits.map((t) => `${t.key}: ${t.value}점`).join('\n')
        let overallSummary = ''
        let strengthsText = ''
        if (typeof window !== 'undefined') {
          const raw = window.localStorage.getItem(STORAGE_KEY)
          if (raw) {
            try {
              const p = JSON.parse(raw)
              const res = p?.result
              if (res?.overall_summary && typeof res.overall_summary === 'string') {
                overallSummary = res.overall_summary
              }
              if (Array.isArray(res?.strengths)) {
                strengthsText = res.strengths.filter((s: unknown) => typeof s === 'string').join('\n- ')
              }
            } catch {
              // ignore
            }
          }
        }

        const { parsed } = await suggestMatchingJobPostingsWithOpenAI({
          roleId,
          traitsText,
          overallSummary,
          strengthsText: strengthsText ? `- ${strengthsText}` : '',
        })

        const jobs = parsed?.jobs
        if (
          !cancelled &&
          Array.isArray(jobs) &&
          jobs.length > 0 &&
          jobs.every((j: unknown) => j && typeof (j as JobMatch).title === 'string')
        ) {
          setJobMatches(
            jobs.map((j: JobMatch) => ({
              title: j.title,
              orgType: j.orgType,
              location: j.location,
              employmentType: j.employmentType,
              whyMatch: j.whyMatch,
            })),
          )
        } else if (!cancelled) {
          setJobMatches(getFallbackJobMatches(roleId, traits))
        }
      } catch {
        if (!cancelled) setJobMatches(getFallbackJobMatches(roleId, traits))
      } finally {
        if (!cancelled) setJobsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [traits, roleId])

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
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem('job_sim_ai_result_error')
        if (raw) {
          const parsed = JSON.parse(raw)
          devError = parsed?.message || ''
        }
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
            href="/simulation"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-all"
          >
            시뮬레이션 다시 진행하기
          </Link>
        </div>
      </div>
    )
  }

  const avgScore =
    traits!.reduce((sum, t) => sum + (typeof t.value === 'number' ? t.value : 0), 0) /
    traits!.length || 0

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
              <h1 className="text-xl sm:text-2xl font-bold !text-white ">
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
          {/* 중앙: 레이더 차트 */}
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
                    const points = traits!.map((_, index) => {
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
                  {traits!.map((_, index) => {
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
                    points={getRadarPoints(traits!.map((t) => t.value))}
                    fill="#818cf8"
                    fillOpacity="0.5"
                    stroke="#818cf8"
                    strokeWidth="2"
                  />
                </svg>

                {/* 라벨 컨테이너 */}
                <div
                  className="absolute w-0 h-0"
                  style={{ left: '50%', top: '50%' }}
                >
                  {traits!.map((trait, index) => {
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

          {/* 우측: 마이크로크리덴셜 + CTA */}
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
                    {interestLabel} 실무 준비도 인증 배지 수여
                  </h2>
                </div>
              </div>

              <p className="relative text-xs sm:text-sm text-white leading-relaxed mb-3">
                이번 시뮬레이션 결과는 자빅스(JOB-EX)의 마이크로크리덴셜 기준을 충족하여,
                &quot;{interestLabel} 실무 준비도&quot; 인증 배지가 부여되었습니다. 해당 배지는 이력서·포트폴리오에
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
                href="/simulation"
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

        {/* 맞춤 채용 직무 (시뮬레이션 프로필 기반 참고용) */}
        <div className="px-6 sm:px-10 pb-10 pt-2">
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-7">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/50 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  당신의 역량에 맞는 현재 채용 중인 직무
                </h3>
                <p className="text-[11px] sm:text-xs text-white/65 mt-1 leading-relaxed">
                  시뮬레이션 답변과 역량 점수·종합 요약을 반영해, 지금 시장에서 자주 열리는 포지션 스타일을
                  골라 제안했습니다. 실제 채용 시기·조건은 기업마다 다르므로 참고용으로 활용해 주세요.
                </p>
              </div>
            </div>

            {jobsLoading && (
              <div className="flex items-center gap-3 py-8 justify-center text-sm text-slate-400">
                <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                맞춤 직무를 준비하는 중입니다…
              </div>
            )}

            {!jobsLoading && jobMatches && jobMatches.length > 0 && (
              <ul className="space-y-3 mt-4">
                {jobMatches.map((job, idx) => (
                  <li
                    key={`${job.title}-${idx}`}
                    className="rounded-2xl border border-slate-700/90 bg-slate-950/50 px-4 py-4 hover:border-indigo-500/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{job.title}</p>
                        <p className="text-[11px] text-indigo-200/90 mt-1">
                          {[job.orgType, job.location, job.employmentType].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                    {job.whyMatch && (
                      <p className="text-[11px] sm:text-xs text-white/75 mt-2 leading-relaxed">{job.whyMatch}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
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
              각 항목은 0~100점 사이로 평가되며, 자빅스(JOB-EX)의 직무별 전문가 패널과 AI 평가 모델이
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

