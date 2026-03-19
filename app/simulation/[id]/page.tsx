'use client'

import React, { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { analyzeAnswerWithOpenAI } from '../../../src/api/openai'

// 기존 SIMULATION_DATA, 컴포넌트 로직은 src/pages/SimulationDetailPage.jsx에서 그대로 가져옴
const SIMULATION_DATA = {
  pm: {
    id: 'pm',
    title: 'PM (서비스 기획)',
    slogan: '문제 정의와 팀의 우선순위 정렬',
    levels: [
      {
        label: 'Level 1 · 채팅 기능 도입 필요성 판단 (기초)',
        summary: '고객센터 채팅 기능 도입이 정말 필요한지, 어떤 데이터로 판단할지 정의해 보세요.',
        description:
          '최근 3개월간 고객센터 문의 중 채팅 관련 문의 비중이 8%에서 21%까지 증가했습니다. 앱 리뷰에는 “실시간 응답이 느리다”, “상담 연결까지 너무 오래 걸린다”는 피드백이 반복되고 있습니다.\n\nPM으로서 채팅/챗봇 기능 도입 필요성을 판단하기 위해, 현재 상황을 한 문장으로 요약하고 핵심 문제 정의를 작성해 주세요. 이어서, 이 문제가 실제로 얼마나 심각한지 검증하기 위해 살펴봐야 할 지표(예: 문의 유형별 티켓 수, 응답 시간, CSAT/NPS, 앱 리뷰 키워드 등)를 3~5개 정리해 주세요.',
      },
      {
        label: 'Level 2 · MVP 기능 정의 및 백로그 작성 (중급)',
        summary: '제한된 리소스 안에서 반드시 포함해야 할 채팅 기능의 MVP 범위를 정의해 보세요.',
        description:
          '개발 리소스는 한 분기당 2개 스쿼드, 스프린트 4회로 제한되어 있습니다. 채팅 기능에 찬성하는 팀과, 우선순위가 낮다고 보는 팀 간 의견이 갈린 상황입니다.\n\n이 상황에서 “반드시 이번 분기에 넣어야 하는 기능(Must)”과 “나중에 추가해도 되는 기능(Nice to have)”을 나누어 핵심 기능 리스트를 작성해 주세요. 각 기능에 대해 간단한 설명과 함께, 왜 Must/Nice로 분류했는지 한 줄씩 정리해 주세요.',
      },
      {
        label: 'Level 3 · 출시 후 KPI 설정 및 AB 테스트 설계 (고급)',
        summary: '채팅 기능 출시 전후로 어떤 지표를, 어떤 실험 구조로 검증할지 설계해 보세요.',
        description:
          '채팅 기능을 도입한 뒤, 실제로 고객 경험과 비즈니스 성과가 좋아졌는지 확인하기 위해서는 명확한 KPI와 실험 설계가 필요합니다.\n\n채팅 기능 도입 전후 성과를 측정하기 위한 핵심 KPI 3~5개를 정의하고, 각 지표가 어떤 행동 변화를 의미하는지 설명해 주세요. 이어서, 가장 중요한 한 가지 가설을 선정해 A/B 테스트(예: 기존 상담 플로우 vs. 채팅 우선 플로우)를 어떻게 설계할지(대상, 기간, 지표, 성공 기준)를 구체적으로 적어 주세요.',
      },
    ],
  },
  da: {
    id: 'da',
    title: 'DA (데이터 분석)',
    slogan: '데이터 기반의 비즈니스 인사이트 도출',
    levels: [
      {
        label: 'Level 1 · 결제 완료율 10% 하락 원인 가설 수립 (기초)',
        summary: '퍼널 데이터를 기반으로 결제 완료율 하락의 가능성 높은 원인들을 구조화해 보세요.',
        description:
          '최근 4주 동안 커머스 서비스의 주간 결제 완료율이 누적 10%p 이상 하락했습니다. 특히 모바일 웹 채널에서 장바구니 이후 단계에서 이탈이 두드러집니다.\n\n데이터 애널리스트로서, 이 현상을 설명할 수 있는 원인 가설을 3개 내외로 도출해 주세요. 각 가설마다 어떤 데이터(퍼널별 전환율, 채널별 전환, 장애 로그, 프로모션 이력 등)를 확인해야 하는지 함께 적어 주세요.',
      },
      {
        label: 'Level 2 · 핵심 지표 선정 및 대시보드 구조 설계 (중급)',
        summary: '경영진이 한눈에 볼 수 있는 핵심 지표와 대시보드 구성을 설계해 보세요.',
        description:
          '다양한 이해관계자가 결제 퍼널 이슈를 빠르게 파악할 수 있도록, 주간 대시보드가 필요합니다. 지표가 너무 많으면 오히려 해석이 어려워집니다.\n\n당신이 생각하는 핵심 지표 5개 내외를 선정하고, 각 지표를 어떤 차원(채널, 디바이스, 신규/기존 고객 등)으로 쪼개서 볼지 정의해 주세요. 이어서, 이 지표들을 어떤 시각화 형태와 레이아웃(상단 요약 카드, 퍼널 차트, 트렌드 그래프 등)으로 배치할지 설명해 주세요.',
      },
      {
        label: 'Level 3 · 가설 검증 분석 설계 및 액션 제안 (고급)',
        summary: '분석 결과를 바탕으로 실행 가능한 액션 플랜까지 연결해 보세요.',
        description:
          '데이터를 살펴본 결과, 특정 채널·디바이스 조합에서 이탈이 집중된다는 신호가 보입니다. 이제 이 신호가 우연이 아닌지 검증하고, 실질적인 개선 액션으로 이어지도록 설계해야 합니다.\n\n결제 완료율을 높이기 위한 가설 2~3개를 선정하고, 각 가설을 어떻게 검증할지(필요한 데이터, 분석 방법, 기간, 통계적 유의수준 등)를 설계해 주세요. 마지막으로, 분석 결과에 따라 실제로 취할 수 있는 액션 아이템을 3개 내외로 제안해 주세요.',
      },
    ],
  },
  marketer: {
    id: 'marketer',
    title: '마케터',
    slogan: '효율적인 매체 믹스와 고객 타겟팅',
    levels: [
      {
        label: 'Level 1 · 20대 대학생 타겟 캠페인 기획 및 KPI 설정 (기초)',
        summary: '핵심 타겟 페르소나와 캠페인 목표를 명확히 정의해 보세요.',
        description:
          '20대 대학생을 주요 타겟으로 한 무선 이어폰 신제품이 2개월 뒤 출시될 예정입니다. 경쟁사는 이미 유튜브·인스타그램·검색광고를 적극 활용 중이며, 우리 브랜드 인지도는 상대적으로 낮은 편입니다.\n\n마케터로서 대표 타겟 페르소나 1명을 정의하고, 이 캠페인의 1차 목표(예: 인지도, 관심, 전환)를 정리해 주세요. 이어서, 캠페인 성과를 측정하기 위한 핵심 KPI 3~5개(예: 도달수, CTR, 전환수, ROAS)를 제안해 주세요.',
      },
      {
        label: 'Level 2 · 매체 믹스 및 메시지 전략 설계 (중급)',
        summary: '인스타그램·유튜브·검색광고 각각의 역할과 메시지 전략을 설계해 보세요.',
        description:
          '캠페인 예산은 제한적이며, “브랜드 인지도 제고”와 “실질적인 구매 전환”을 동시에 달성해야 합니다. 각 매체마다 강점과 역할이 다릅니다.\n\n인스타그램, 유튜브, 검색광고에 대해 각각 어떤 역할(인지/흥미/전환)을 맡길지 정의하고, 각 매체에 어울리는 핵심 메시지와 크리에이티브 방향을 간단히 설계해 주세요. 예산 배분 비율(%)과 기대하는 결과를 함께 적어 주세요.',
      },
      {
        label: 'Level 3 · 캠페인 성과 분석 및 AB 테스트 설계 (고급)',
        summary: '캠페인 운영 중 어떤 실험을 통해 학습 효율을 높일지 설계해 보세요.',
        description:
          '첫 번째 캠페인 집행 후, 일부 매체에서는 클릭률은 높지만 전환율은 낮고, 다른 매체에서는 소수의 클릭으로도 높은 전환율을 보이는 등 결과가 혼재되어 있습니다.\n\n캠페인 성과를 개선하기 위해 반드시 진행해야 할 A/B 테스트 1~2개를 정의해 주세요. 예를 들어 “할인 혜택 강조 vs. 브랜드 스토리 강조” 메시지 비교, “크리에이티브 A vs. B” 비교 등 실험을 설계하고, 각 실험의 목표 지표, 타겟, 기간, 예산 배분 방식을 구체적으로 적어 주세요.',
      },
    ],
  },
}

type SimParams = { id: string }

/** Next.js 15+: `params` is a Promise; unwrap with `use()` in Client Components */
function useRouteParams(params: Promise<SimParams> | SimParams): SimParams {
  if (params != null && typeof (params as Promise<SimParams>).then === 'function') {
    return use(params as Promise<SimParams>)
  }
  return params as SimParams
}

export default function SimulationDetailPage({
  params,
}: {
  params: Promise<SimParams> | SimParams
}) {
  const router = useRouter()
  const { id: rawId } = useRouteParams(params)
  const id = (rawId || 'pm').toLowerCase()
  const roleData = SIMULATION_DATA[id as keyof typeof SIMULATION_DATA] || SIMULATION_DATA.pm

  const [currentLevel, setCurrentLevel] = useState(0)
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingType, setLoadingType] = useState<'next' | 'analyze' | null>(null)
  const [aiFeedback, setAiFeedback] = useState<any>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [error, setError] = useState('')

  const levelData = roleData.levels[currentLevel]
  const isLastLevel = currentLevel === roleData.levels.length - 1

  const fetchAICheck = async (advanceAfter = false) => {
    if (!answer.trim()) {
      setError('답안을 먼저 입력해 주세요.')
      return
    }

    setError('')
    setIsLoading(true)
    setHasSubmitted(true)

    try {
      const { raw, parsed } = await analyzeAnswerWithOpenAI(answer, id)

      let structured: any = parsed

      if (!structured && raw) {
        try {
          structured = JSON.parse(raw)
        } catch {
          structured = null
        }
      }

      if (structured && typeof structured === 'object') {
        const items = Object.entries(structured)
          .map(([label, value]: any) => {
            if (!value || typeof value !== 'object') return null
            const score = value.score ?? value.점수 ?? null
            const reason = value.reason ?? value.평가이유 ?? value.feedback ?? ''
            if (!reason && score == null) return null
            return { label, score, reason }
          })
          .filter(Boolean)

        const summary =
          items.length > 0 ? items.map((it: any) => `${it.label}: ${it.reason}`).join(' ') : raw || ''

        setAiFeedback({ summary, items })
      } else {
        setAiFeedback(raw || '')
      }

      if (typeof window !== 'undefined') {
        const historyKey = 'job_sim_ai_history'
        try {
          const rawHistory = window.localStorage.getItem(historyKey)
          const parsedHistory = rawHistory ? JSON.parse(rawHistory) : []
          const nextHistory = [
            ...parsedHistory,
            {
              roleId: id,
              levelIndex: currentLevel,
              levelLabel: levelData.label,
              answer,
              result: structured || null,
              analyzedAt: new Date().toISOString(),
            },
          ]
          window.localStorage.setItem(historyKey, JSON.stringify(nextHistory))
        } catch {
          // ignore
        }
      }

      setShowNext(true)

      if (advanceAfter) {
        if (isLastLevel) {
          if (typeof window !== 'undefined') {
            const payload = {
              roleId: id,
              levelsCompleted: currentLevel + 1,
              answer,
              result: structured || null,
              analyzedAt: new Date().toISOString(),
            }
            window.localStorage.setItem('job_sim_ai_result', JSON.stringify(payload))
          }
          router.replace('/result')
          return
        }

        setCurrentLevel((prev) => Math.min(prev + 1, roleData.levels.length - 1))
        setAnswer('')
        setAiFeedback(null)
        setShowNext(false)
        setError('')
      }
    } catch (e: any) {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            'job_sim_ai_result_error',
            JSON.stringify({ message: e?.message || '알 수 없는 오류가 발생했습니다.' }),
          )
        }
      } catch {
        // ignore
      }
      setError('AI 분석에 실패했습니다. API 키를 확인해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    await fetchAICheck(false)
  }

  const handleStepChange = async (mode: 'next' | 'analyze') => {
    if (!answer.trim()) {
      setError('답안을 먼저 입력해 주세요.')
      return
    }

    if (mode === 'next' && isLastLevel) {
      mode = 'analyze'
    }

    if (mode === 'next') {
      setLoadingType('next')
      setIsLoading(true)
      setTimeout(async () => {
        await fetchAICheck(true)
        setIsLoading(false)
        setLoadingType(null)
      }, 800)
    } else if (mode === 'analyze') {
      setLoadingType('analyze')
      setIsLoading(true)
      const start = Date.now()
      await fetchAICheck(true)
      const elapsed = Date.now() - start
      const remain = 2500 - elapsed
      if (remain > 0) {
        setTimeout(() => {
          setIsLoading(false)
          setLoadingType(null)
        }, remain)
      } else {
        setIsLoading(false)
        setLoadingType(null)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 font-sans">
      {isLoading && loadingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm sm:text-base font-semibold text-white">
              {loadingType === 'next' ? '다음 단계로 이동 중...' : 'PM 실무 역량 정밀 분석 중...'}
            </p>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-indigo-600 truncate">{roleData.title}</h1>
            <span className="text-slate-300">|</span>
            <p className="text-xs sm:text-sm text-slate-600 truncate">{roleData.slogan}</p>
          </div>
          <Link href="/simulation" className="text-xs text-slate-400 hover:text-indigo-600 whitespace-nowrap">
            ← 다른 직무 선택
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[520px]">
          <div className="flex-1 px-8 py-8 space-y-4 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {levelData.label}
              </span>
              <span className="text-[11px] text-slate-400">
                {currentLevel + 1} / {roleData.levels.length} 단계
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-700">{roleData.title} | 단계별 실무 과제</p>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {levelData.summary}
            </p>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {levelData.description}
            </p>

            {hasSubmitted ? (
              <div className="mt-6 bg-slate-50 border border-indigo-100 rounded-2xl p-4 sm:p-5 text-sm text-slate-700">
                <p className="text-xs font-semibold text-indigo-600 mb-2">AI 실무진 분석 피드백</p>
                {isLoading && !aiFeedback && (
                  <p className="text-xs text-slate-500">AI 심사위원이 답변을 정밀 분석 중입니다...</p>
                )}
                {!isLoading && aiFeedback && typeof aiFeedback === 'string' && (
                  <p className="whitespace-pre-wrap">{aiFeedback}</p>
                )}
                {!isLoading && aiFeedback && typeof aiFeedback === 'object' && (
                  <div className="space-y-3">
                    <p className="font-semibold text-slate-800 whitespace-pre-wrap">{aiFeedback.summary}</p>
                    {aiFeedback.items && aiFeedback.items.length > 0 && (
                      <ul className="mt-1 space-y-1 text-xs sm:text-sm text-slate-700">
                        {aiFeedback.items.map((it: any) => (
                          <li key={it.label} className="flex gap-1">
                            <span className="font-semibold text-slate-800 min-w-[80px]">{it.label}</span>
                            <span className="text-slate-500">
                              {it.score != null ? `${it.score}점 - ` : ''}
                              {it.reason}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-6 text-xs text-slate-400">
                답변을 제출하면 AI 심사위원이 루브릭을 기준으로 정밀 분석을 시작합니다.
              </p>
            )}
          </div>

          <div className="w-full md:w-[360px] bg-slate-50/60 p-6 md:p-8 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col gap-4">
            <div className="flex-1 flex flex-col">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">답안 작성</h2>
              <textarea
                className="flex-1 min-h-[180px] w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white resize-none"
                placeholder="이 상황에서 당신이라면 어떻게 판단하고 행동할지, 구체적으로 작성해 보세요."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              {error && (
                <p className="mt-2 text-xs text-rose-500">
                  {error}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {!showNext && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? '전문가 피드백 생성 중...' : '제출하기'}
                </button>
              )}

              {showNext && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAnswer('')
                      setAiFeedback('')
                      setHasSubmitted(false)
                      setShowNext(false)
                      setError('')
                    }}
                    className="flex-1 py-3.5 bg-white text-sm font-semibold text-indigo-600 rounded-xl border border-indigo-600 hover:bg-indigo-50 transition-all"
                  >
                    다시 도전하기
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepChange(isLastLevel ? 'analyze' : 'next')}
                    className="flex-1 py-3.5 bg-indigo-600 text-sm font-semibold text-white rounded-xl hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    {isLastLevel ? '최종 역량 리포트 확인하기' : '다음 레벨 도전하기'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

