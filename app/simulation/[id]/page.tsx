'use client'

import React, { use, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  generateRandomSimulationTask,
  analyzeSimulationStepWithOpenAI,
  analyzeSimulationFinalWithOpenAI,
} from '../../../src/api/openai'

const QUESTION_VARIANTS_PER_LEVEL = 15

const TRAIT_KEYS = ['문제해결력', '커뮤니케이션', '직무이해력', '완수율', '전문지식'] as const

type TraitKey = (typeof TRAIT_KEYS)[number]

type SimParams = { id: string }

type TaskPayload = {
  domain: string
  taskTitle: string
  situation: string
  requirements: string[]
  constraints: string[]
  variantIndex?: number
}

type StepRecord = {
  task: TaskPayload
  answer: string
  parsed: Record<string, unknown> | null
}

const ROLE_LABEL: Record<string, string> = {
  pm: 'PM (서비스/프로덕트 기획)',
  da: '데이터 분석가 (Data Analyst)',
  marketer: '마케터 (Marketer)',
}

function useRouteParams(params: Promise<SimParams> | SimParams): SimParams {
  if (params != null && typeof (params as Promise<SimParams>).then === 'function') {
    return use(params as Promise<SimParams>)
  }
  return params as SimParams
}

function pickVariantIndex(used: number[]): number {
  const pool = Array.from({ length: QUESTION_VARIANTS_PER_LEVEL }, (_, i) => i + 1).filter(
    (n) => !used.includes(n),
  )
  if (pool.length === 0) {
    return Math.floor(Math.random() * QUESTION_VARIANTS_PER_LEVEL) + 1
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

function normalizeTask(parsed: Record<string, unknown> | null, fallbackLevel: number): TaskPayload | null {
  if (!parsed || typeof parsed !== 'object') return null
  const domain = typeof parsed.domain === 'string' ? parsed.domain : 'Edutech'
  const taskTitle = typeof parsed.taskTitle === 'string' ? parsed.taskTitle : ''
  const situation = typeof parsed.situation === 'string' ? parsed.situation : ''
  const requirements = Array.isArray(parsed.requirements)
    ? parsed.requirements.filter((x): x is string => typeof x === 'string')
    : []
  const constraints = Array.isArray(parsed.constraints)
    ? parsed.constraints.filter((x): x is string => typeof x === 'string')
    : []
  const variantIndex = typeof parsed.variantIndex === 'number' ? parsed.variantIndex : undefined
  if (!taskTitle || !situation || requirements.length === 0) return null
  return {
    domain,
    taskTitle,
    situation,
    requirements,
    constraints: constraints.length ? constraints : ['단기간 실행 가능한 액션 위주로 작성할 것.'],
    variantIndex,
  }
}

function extractTraitRows(parsed: Record<string, unknown> | null): { label: string; score: number; reason: string }[] {
  if (!parsed) return []
  return TRAIT_KEYS.map((key) => {
    const block = parsed[key] as { score?: number; reason?: string; 점수?: number; 평가이유?: string } | undefined
    if (!block || typeof block !== 'object') {
      return { label: key, score: 0, reason: '' }
    }
    const score = typeof block.score === 'number' ? block.score : typeof block.점수 === 'number' ? block.점수 : 0
    const reason =
      typeof block.reason === 'string' ? block.reason : typeof block.평가이유 === 'string' ? block.평가이유 : ''
    return { label: key, score, reason }
  })
}

function extractImprovements(parsed: Record<string, unknown> | null): string[] {
  const imp = parsed?.improvements
  if (!Array.isArray(imp)) return []
  return imp.filter((x): x is string => typeof x === 'string')
}

function extractBestAnswer(parsed: Record<string, unknown> | null): string {
  const b = parsed?.best_answer
  return typeof b === 'string' ? b : ''
}

export default function SimulationDetailPage({
  params,
}: {
  params: Promise<SimParams> | SimParams
}) {
  const router = useRouter()
  const { id: rawId } = useRouteParams(params)
  const roleId = (rawId || 'pm').toLowerCase()
  const roleKey = roleId === 'da' || roleId === 'marketer' ? roleId : 'pm'
  const roleTitle = ROLE_LABEL[roleKey] || ROLE_LABEL.pm

  const [flowStep, setFlowStep] = useState<1 | 2 | 3>(1)
  /** 레벨별로 이미 출제된 variant(1~15) — ref로 두어 비동기 클로저에 안 걸리게 함 */
  const usedVariantsRef = useRef<Record<number, number[]>>({ 1: [], 2: [], 3: [] })
  const [stepRecords, setStepRecords] = useState<StepRecord[]>([])

  const [currentTask, setCurrentTask] = useState<TaskPayload | null>(null)
  const [answer, setAnswer] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [feedbackParsed, setFeedbackParsed] = useState<Record<string, unknown> | null>(null)

  const [initialLoading, setInitialLoading] = useState(true)
  const [taskLoading, setTaskLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [error, setError] = useState('')

  const loadTaskForStep = useCallback(
    async (step: 1 | 2 | 3) => {
      setError('')
      setTaskLoading(true)
      setCurrentTask(null)
      setAnswer('')
      setHasSubmitted(false)
      setFeedbackParsed(null)

      const used = usedVariantsRef.current[step] || []
      const variantIndex = pickVariantIndex(used)

      try {
        const { parsed } = await generateRandomSimulationTask({
          roleId: roleKey,
          levelIndex: step,
          variantIndex,
        })
        const task = normalizeTask(parsed as Record<string, unknown> | null, step)
        if (!task) {
          throw new Error('문제 형식을 해석하지 못했습니다. 다시 시도해 주세요.')
        }
        setCurrentTask(task)
        usedVariantsRef.current[step] = [...used, variantIndex]
      } catch (e: any) {
        setError(e?.message || '문제를 불러오지 못했습니다.')
        setCurrentTask(null)
      } finally {
        setTaskLoading(false)
        setInitialLoading(false)
      }
    },
    [roleKey],
  )

  useEffect(() => {
    usedVariantsRef.current = { 1: [], 2: [], 3: [] }
    setFlowStep(1)
    setStepRecords([])
    void loadTaskForStep(1)
  }, [roleKey, loadTaskForStep])

  const handleReset = () => {
    setFlowStep(1)
    usedVariantsRef.current = { 1: [], 2: [], 3: [] }
    setStepRecords([])
    setInitialLoading(true)
    void loadTaskForStep(1)
  }

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError('답안을 먼저 입력해 주세요.')
      return
    }
    if (!currentTask) return

    setError('')
    setAnalyzing(true)
    try {
      const { parsed } = await analyzeSimulationStepWithOpenAI({
        answerText: answer,
        roleId: roleKey,
        stepNumber: flowStep,
        taskTitle: currentTask.taskTitle,
        situation: currentTask.situation,
        requirements: currentTask.requirements,
        constraints: currentTask.constraints,
      })
      setFeedbackParsed((parsed as Record<string, unknown>) || null)
      setHasSubmitted(true)

      setStepRecords((prev) => {
        const next = [...prev]
        const idx = flowStep - 1
        next[idx] = {
          task: currentTask,
          answer,
          parsed: (parsed as Record<string, unknown>) || null,
        }
        return next
      })

      if (typeof window !== 'undefined') {
        const historyKey = 'job_sim_ai_history'
        try {
          const rawHistory = window.localStorage.getItem(historyKey)
          const parsedHistory = rawHistory ? JSON.parse(rawHistory) : []
          const traitBlock: Partial<Record<TraitKey, { score: number; reason: string }>> = {}
          TRAIT_KEYS.forEach((k) => {
            const row = (parsed as any)?.[k]
            if (row && typeof row.score === 'number') {
              traitBlock[k] = { score: row.score, reason: row.reason || '' }
            }
          })
          parsedHistory.push({
            roleId: roleKey,
            levelIndex: flowStep,
            levelLabel: currentTask.taskTitle,
            answer,
            result: Object.keys(traitBlock).length ? traitBlock : parsed,
            analyzedAt: new Date().toISOString(),
          })
          window.localStorage.setItem(historyKey, JSON.stringify(parsedHistory))
        } catch {
          // ignore
        }
      }
    } catch (e: any) {
      setError(e?.message || 'AI 분석에 실패했습니다.')
    } finally {
      setAnalyzing(false)
    }
  }

  const goNextStep = async () => {
    if (flowStep < 3) {
      const next = (flowStep + 1) as 1 | 2 | 3
      setFlowStep(next)
      setInitialLoading(true)
      await loadTaskForStep(next)
      return
    }

    // Step 3 → 최종 (stepRecords 비동기 반영 직후 클릭 대비: 현재 화면 상태 병합)
    setFinalizing(true)
    try {
      const records: (StepRecord | undefined)[] = [...stepRecords]
      if (flowStep === 3 && currentTask && answer.trim()) {
        records[2] = { task: currentTask, answer, parsed: feedbackParsed }
      }
      const steps = [1, 2, 3].map((n) => {
        const rec = records[n - 1]
        return {
          taskTitle: rec?.task?.taskTitle || `Step ${n}`,
          situation: rec?.task?.situation || '',
          answerText: rec?.answer || '',
        }
      })

      const { parsed } = await analyzeSimulationFinalWithOpenAI({
        roleId: roleKey,
        jobKey: roleKey,
        steps,
      })

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'job_sim_ai_result',
          JSON.stringify({
            roleId: roleKey,
            result: parsed,
            analyzedAt: new Date().toISOString(),
          }),
        )
      }
      router.replace('/result')
    } catch (e: any) {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            'job_sim_ai_result_error',
            JSON.stringify({ message: e?.message || '최종 분석 실패' }),
          )
        }
      } catch {
        // ignore
      }
      setError(e?.message || '최종 리포트 생성에 실패했습니다.')
    } finally {
      setFinalizing(false)
    }
  }

  const traitRows = extractTraitRows(feedbackParsed)
  const improvements = extractImprovements(feedbackParsed)
  const bestAnswer = extractBestAnswer(feedbackParsed)

  const showOverlay = initialLoading || taskLoading || analyzing || finalizing

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12">
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm sm:text-base font-semibold text-white">
              {finalizing
                ? '최종 리포트를 생성하는 중입니다…'
                : analyzing
                  ? 'AI가 답안을 분석하는 중입니다…'
                  : '문제를 불러오는 중입니다…'}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.18em] mb-1">
              JOB-EX Simulation
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">자빅스(JOB-EX) 실전 시뮬레이션</h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              1~3단계는 주관식 제출 후 바로 AI 피드백과 모범 답안을 받고, 4단계에서 최종 리포트를 확인합니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition-colors"
            >
              처음부터 다시
            </button>
            <Link
              href="/simulation"
              className="px-4 py-2 text-sm font-medium rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              ← 직무 선택
            </Link>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex flex-wrap gap-2 mb-8">
          {([1, 2, 3] as const).map((n) => (
            <span
              key={n}
              className={`inline-flex items-center px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-colors ${
                flowStep === n
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              Step {n}
            </span>
          ))}
          <span
            className={`inline-flex items-center px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border ${
              finalizing ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            최종
          </span>
        </div>

        {error && !currentTask && !taskLoading && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
            <button
              type="button"
              onClick={() => void loadTaskForStep(flowStep)}
              className="ml-3 underline font-semibold"
            >
              다시 시도
            </button>
          </div>
        )}

        {currentTask && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* Left: problem */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                {roleTitle}
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">{currentTask.taskTitle}</h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-semibold text-slate-800">[Domain: {currentTask.domain}]</span>{' '}
                {currentTask.situation}
              </p>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">요구사항</h3>
                <ul className="space-y-2">
                  {currentTask.requirements.map((req, i) => (
                    <li
                      key={i}
                      className="text-sm text-slate-700 bg-slate-100 rounded-xl px-4 py-3 border border-slate-100"
                    >
                      <span className="font-semibold text-indigo-700 mr-2">{i + 1}.</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">제약조건</h3>
                <ul className="space-y-2">
                  {currentTask.constraints.map((c, i) => (
                    <li
                      key={i}
                      className="text-sm text-slate-700 bg-slate-100 rounded-xl px-4 py-3 border border-slate-100"
                    >
                      <span className="font-semibold text-indigo-700 mr-2">{i + 1}.</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: answer + feedback */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col gap-4">
              <h2 className="text-sm font-bold text-slate-900">답안 작성</h2>
              <textarea
                className="min-h-[200px] w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white resize-y text-slate-800"
                placeholder="이 상황에서 당신이라면 어떻게 판단하고 행동할지, 구체적으로 작성해 보세요."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={hasSubmitted}
              />
              {error && currentTask && <p className="text-xs text-rose-600">{error}</p>}

              {!hasSubmitted && (
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={analyzing}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-sm disabled:opacity-60 transition-all"
                >
                  제출하기
                </button>
              )}

              {hasSubmitted && (
                <>
                  <button
                    type="button"
                    onClick={() => void goNextStep()}
                    disabled={finalizing}
                    className="w-full py-3.5 rounded-xl border-2 border-indigo-600 bg-indigo-50 text-indigo-800 text-sm font-bold hover:bg-indigo-100 transition-all disabled:opacity-60"
                  >
                    {flowStep < 3 ? '다음 단계로' : '최종 리포트 확인하기'}
                  </button>

                  <div className="mt-2 rounded-2xl border border-indigo-100 bg-slate-50/80 p-4 sm:p-5 space-y-4">
                    <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">AI 현직자 피드백</p>

                    <ul className="space-y-2 text-sm">
                      {traitRows.map((row) => (
                        <li key={row.label} className="flex justify-between gap-3 border-b border-slate-200/80 pb-2 last:border-0">
                          <span className="font-semibold text-slate-800">{row.label}</span>
                          <span className="text-indigo-700 font-bold tabular-nums">
                            {row.score > 0 ? `${Math.round(row.score)}점` : '—'}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {traitRows.some((r) => r.reason) && (
                      <div className="text-xs text-slate-600 space-y-1">
                        {traitRows
                          .filter((r) => r.reason)
                          .map((r) => (
                            <p key={r.label}>
                              <span className="font-semibold text-slate-800">{r.label}:</span> {r.reason}
                            </p>
                          ))}
                      </div>
                    )}

                    {improvements.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-2">보완점</p>
                        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                          {improvements.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {bestAnswer && (
                      <div>
                        <p className="text-sm font-bold text-slate-900 mb-2">모범 답안</p>
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap rounded-xl bg-white border border-slate-200 p-4">
                          {bestAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
