import React, { useEffect, useMemo, useState } from 'react'
import { Clock, ArrowRight } from 'lucide-react'
import LoadingOverlay from '../components/LoadingOverlay'
import {
  analyzeSimulationFinalWithOpenAI,
  analyzeSimulationStepWithOpenAI,
} from '../api/openai'

const JOB_IMAGES = {
  pm: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600',
  data: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600',
  marketing: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?q=80&w=600',
}

const JOB_CARDS = [
  { id: 'pm', tag: '서비스 기획 (PM)', title: 'PM 실무 역량 리허설', duration: '약 30~40분' },
  { id: 'data', tag: '데이터 분석가 (Data Analyst)', title: 'DA 실무 역량 리허설', duration: '약 30~40분' },
  { id: 'marketing', tag: '마케터 (Marketer)', title: '마케팅 실무 역량 리허설', duration: '약 30~40분' },
]

const JOB_KEY_MAP = {
  pm: 'PM',
  data: 'DA',
  marketing: 'Marketer',
}

const ROLE_ID_MAP = {
  PM: 'pm',
  DA: 'da',
  Marketer: 'marketer',
}

const TRAIT_KEYS = ['문제해결력', '커뮤니케이션', '직무이해력', '완수율', '전문지식']
const center = { x: 160, y: 160 }
const maxRadius = 110
const START_ANGLE = -Math.PI / 2

function getRadarPoints(scores) {
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

export default function SimulationPage() {
  // currentStep: 0=직무 선택, 1~3=주관식 제출+피드백, 4=최종 리포트
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [jobKey, setJobKey] = useState(null) // 'PM' | 'DA' | 'Marketer'

  const roleId = useMemo(() => (jobKey ? ROLE_ID_MAP[jobKey] : 'pm'), [jobKey])

  const [stepTasks, setStepTasks] = useState({ 1: null, 2: null, 3: null })
  const [sessionData, setSessionData] = useState([
    { step: 1, answerText: '', taskTitle: '', situation: '', feedback: null },
    { step: 2, answerText: '', taskTitle: '', situation: '', feedback: null },
    { step: 3, answerText: '', taskTitle: '', situation: '', feedback: null },
  ])

  const [currentAnswer, setCurrentAnswer] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [taskLoading, setTaskLoading] = useState(false)
  const [error, setError] = useState('')

  const [finalReport, setFinalReport] = useState(null) // parsed JSON

  const loadingOpen = feedbackLoading || taskLoading
  const loadingMessage = feedbackLoading
    ? 'AI 코치가 실무 답변을 분석 중입니다...'
    : '과제 시나리오를 불러오는 중입니다...'

  const currentTask = currentStep >= 1 && currentStep <= 3 ? stepTasks[currentStep] : null

  const canNext =
    currentStep >= 1 &&
    currentStep <= 3 &&
    sessionData[currentStep - 1]?.feedback != null &&
    !feedbackLoading &&
    !taskLoading

  const fetchTaskForLevel = async (nextJobKey, levelNum) => {
    const seed = Math.floor(Math.random() * 1_000_000_000)
    const url = `/api/generate?job=${encodeURIComponent(
      nextJobKey,
    )}&level=${encodeURIComponent(
      String(levelNum),
    )}&seed=${encodeURIComponent(String(seed))}&t=${Date.now()}`

    const res = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job: nextJobKey, level: levelNum, seed }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`generate 실패: API ${res.status} - ${text}`)
    }

    const data = await res.json()
    return data
  }

  const resetFlow = () => {
    setCurrentStep(0)
    setSelectedJobId(null)
    setJobKey(null)
    setStepTasks({ 1: null, 2: null, 3: null })
    setSessionData([
      { step: 1, answerText: '', taskTitle: '', situation: '', feedback: null },
      { step: 2, answerText: '', taskTitle: '', situation: '', feedback: null },
      { step: 3, answerText: '', taskTitle: '', situation: '', feedback: null },
    ])
    setCurrentAnswer('')
    setFinalReport(null)
    setError('')
  }

  const startSimulation = async (cardId) => {
    setError('')
    setFinalReport(null)
    setCurrentAnswer('')

    const nextJobKey = JOB_KEY_MAP[cardId]
    if (!nextJobKey) {
      setError('직무 정보를 찾을 수 없습니다.')
      return
    }

    setSelectedJobId(cardId)
    setJobKey(nextJobKey)
    setCurrentStep(1)

    setTaskLoading(true)
    try {
      const task = await fetchTaskForLevel(nextJobKey, 1)
      setStepTasks((prev) => ({ ...prev, 1: task }))
      setSessionData((prev) => {
        const next = [...prev]
        next[0] = { ...next[0], taskTitle: task.task_title || '', situation: task.situation || '' }
        return next
      })
    } catch (e) {
      setError(e?.message || '과제를 불러오지 못했습니다.')
    } finally {
      setTaskLoading(false)
    }
  }

  const handleSubmitStep = async () => {
    if (!currentTask) return
    const answerText = currentAnswer.trim()
    if (!answerText) {
      setError('답안을 먼저 입력해 주세요.')
      return
    }

    setError('')
    setFeedbackLoading(true)
    try {
      const stepNumber = currentStep
      const res = await analyzeSimulationStepWithOpenAI({
        answerText,
        roleId,
        stepNumber,
        taskTitle: currentTask.task_title,
        situation: currentTask.situation,
        requirements: currentTask.requirements || [],
      })

      setSessionData((prev) => {
        const next = [...prev]
        next[stepNumber - 1] = {
          ...next[stepNumber - 1],
          answerText,
          // parsed가 null이어도 raw는 저장해서 UI에서 원문을 보여줄 수 있게 함
          feedback: {
            parsed: res?.parsed ?? null,
            raw: res?.raw ?? '',
          },
        }
        return next
      })
    } catch (e) {
      setError(e?.message || 'AI 분석에 실패했습니다.')
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleNext = async () => {
    setError('')
    setCurrentAnswer('')

    const nextStep = currentStep + 1
    if (nextStep >= 4) {
      // 최종 리포트 분석
      setFeedbackLoading(true)
      try {
        const stepsPayload = [1, 2, 3].map((n) => {
          const t = stepTasks[n]
          return {
            stepNumber: n,
            taskTitle: t?.task_title || '',
            situation: t?.situation || '',
            answerText: sessionData[n - 1]?.answerText || '',
          }
        })

        const res = await analyzeSimulationFinalWithOpenAI({
          roleId,
          jobKey: jobKey || '',
          steps: stepsPayload,
        })

        if (!res?.parsed) throw new Error('최종 리포트 생성에 실패했습니다.')
        setFinalReport(res.parsed)
        setCurrentStep(4)
      } catch (e) {
        setError(e?.message || '최종 리포트 분석에 실패했습니다.')
      } finally {
        setFeedbackLoading(false)
      }

      return
    }

    // 다음 단계 과제 로드
    setCurrentStep(nextStep)
    setTaskLoading(true)
    try {
      const task = await fetchTaskForLevel(jobKey, nextStep)
      setStepTasks((prev) => ({ ...prev, [nextStep]: task }))
      setSessionData((prev) => {
        const next = [...prev]
        next[nextStep - 1] = {
          ...next[nextStep - 1],
          taskTitle: task.task_title || '',
          situation: task.situation || '',
        }
        return next
      })
    } catch (e) {
      setError(e?.message || '다음 단계 과제를 불러오지 못했습니다.')
    } finally {
      setTaskLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] w-full">
      <LoadingOverlay open={loadingOpen} message={loadingMessage} />

      {/* Step Header */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B] tracking-tight">
              자빅스(JOB-EX) 실전 시뮬레이션
            </h1>
            <p className="text-slate-600 mt-2">
              1~3단계는 주관식 제출 후 바로 AI 피드백과 모범 답안을 받고, 4단계에서 최종 리포트를 확인합니다.
            </p>
          </div>

          {currentStep > 0 && (
            <button
              type="button"
              onClick={resetFlow}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:shadow-sm hover:border-indigo-200 transition-all"
            >
              처음부터 다시
            </button>
          )}
        </div>

        {/* Progress */}
        {currentStep > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((n) => {
              const active = currentStep === n
              const done = currentStep > n
              return (
                <div
                  key={n}
                  className={[
                    'px-3 py-1 rounded-full text-xs font-semibold border transition-all',
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : done
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        : 'bg-white text-slate-500 border-slate-200',
                  ].join(' ')}
                >
                  {n === 4 ? '최종' : `Step ${n}`}
                </div>
              )
            })}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Step 0: Job Selection */}
        {currentStep === 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {JOB_CARDS.map((card) => (
              <article
                key={card.id}
                className="flex flex-col h-full bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200/80 hover:shadow-md hover:border-slate-200 transition-all"
              >
                <img
                  src={JOB_IMAGES[card.id]}
                  alt={card.tag}
                  className="w-full h-40 object-cover flex-shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between p-6">
                  <div className="space-y-2">
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-xl">
                      {card.tag}
                    </span>
                    <h2 className="text-base font-bold text-[#1E293B] leading-snug">{card.title}</h2>
                  </div>
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{card.duration}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => startSimulation(card.id)}
                      disabled={taskLoading || feedbackLoading}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white text-sm font-semibold rounded-2xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      시작하기
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Step 1~3: Task + Answer */}
        {currentStep >= 1 && currentStep <= 3 && currentTask && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Step {currentStep}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 truncate">{currentTask.task_title}</span>
                </div>
                <div className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {currentTask.situation}
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 mb-2">요구사항</h2>
                  <ul className="space-y-2">
                    {(currentTask.requirements || []).map((it, idx) => (
                      <li key={idx} className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="text-slate-500 text-xs font-semibold mt-0.5">{idx + 1}</span>
                        <p className="text-sm text-slate-700">{it}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-900 mb-2">제약조건</h2>
                  <ul className="space-y-2">
                    {(currentTask.constraints || []).map((it, idx) => (
                      <li key={idx} className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="text-slate-500 text-xs font-semibold mt-0.5">{idx + 1}</span>
                        <p className="text-sm text-slate-700">{it}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">답안 작성</h2>
              <textarea
                className="min-h-[220px] w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white resize-none"
                placeholder="이 상황에서 당신이라면 어떻게 판단하고 행동할지, 구체적으로 작성해 보세요."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={feedbackLoading || taskLoading}
              />

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={handleSubmitStep}
                  disabled={feedbackLoading || taskLoading}
                  className="w-full py-3.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {feedbackLoading ? 'AI 피드백 생성 중...' : '제출하기'}
                </button>

                {sessionData[currentStep - 1]?.feedback && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3.5 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all"
                  >
                    {currentStep < 3 ? '다음 단계로' : '최종 리포트로'}
                  </button>
                )}
              </div>
              {sessionData[currentStep - 1]?.feedback && (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-indigo-50 border border-indigo-200 px-4 py-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-2">AI 현직자 피드백</h3>
                    {sessionData[currentStep - 1]?.feedback?.parsed ? (
                      <div className="space-y-2">
                        {TRAIT_KEYS.map((k) => {
                          const info = sessionData[currentStep - 1]?.feedback?.parsed?.[k]
                          const score = info?.score ?? info?.점수
                          return (
                            <div key={k} className="flex items-start justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-800">{k}</p>
                              <p className="text-sm font-semibold text-indigo-700">
                                {typeof score === 'number' ? `${score}점` : '-'}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <pre className="text-sm text-slate-800 whitespace-pre-wrap rounded-2xl bg-white border border-indigo-200 p-4 mt-3">
                        {sessionData[currentStep - 1]?.feedback?.raw || 'AI 원문을 표시할 수 없습니다.'}
                      </pre>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">보완점</h3>
                    {sessionData[currentStep - 1]?.feedback?.parsed ? (
                      <ul className="space-y-2">
                        {(sessionData[currentStep - 1]?.feedback?.parsed?.improvements || []).map((t, idx) => (
                          <li key={idx} className="text-sm text-slate-700">
                            - {t}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-600">
                        JSON 파싱에 실패했어요. 위에 원문 응답을 확인해 주세요.
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">모범 답안</h3>
                    <pre className="text-sm text-slate-800 whitespace-pre-wrap rounded-2xl bg-slate-50 border border-slate-200 p-4 leading-relaxed">
                      {sessionData[currentStep - 1]?.feedback?.parsed?.best_answer || ''}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Final Report */}
        {currentStep === 4 && finalReport && (
          <div className="mt-8 bg-[#020617] rounded-3xl border border-slate-800 overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    {jobKey} 실무 준비도 · 최종 리포트
                  </h2>
                  <p className="text-sm text-white/80 mt-2">
                    {finalReport.overall_summary || '종합 분석을 기반으로 최종 리포트를 구성했습니다.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 sm:p-6">
                <div className="relative flex items-center justify-center">
                  <svg viewBox="0 0 320 320" className="w-full max-w-md">
                    {[0.35, 0.65, 1].map((ratio, ringIndex) => {
                      const r = maxRadius * ratio
                      const points = TRAIT_KEYS.map((_, index) => {
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

                    {TRAIT_KEYS.map((_, index) => {
                      const angle = START_ANGLE + (index * 2 * Math.PI) / 5
                      const x = center.x + maxRadius * Math.cos(angle)
                      const y = center.y + maxRadius * Math.sin(angle)
                      return (
                        <line
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

                    {(() => {
                      const scores = TRAIT_KEYS.map((k) => {
                        const info = finalReport[k]
                        const score = info?.score ?? info?.점수 ?? 0
                        return Math.max(0, Math.min(100, Number(score) || 0))
                      })
                      const points = getRadarPoints(scores)
                      return (
                        <>
                          <polygon points={points} fill="rgba(99,102,241,0.5)" stroke="#818cf8" strokeWidth="2" />
                          {scores.map((value, index) => {
                            const angle = START_ANGLE + (index * 2 * Math.PI) / 5
                            const radius = (value / 100) * maxRadius
                            const x = center.x + radius * Math.cos(angle)
                            const y = center.y + radius * Math.sin(angle)
                            return <circle key={index} cx={x} cy={y} r="3" fill="#818cf8" />
                          })}
                        </>
                      )
                    })()}
                  </svg>

                  {/* Labels */}
                  <div className="absolute w-0 h-0" style={{ left: '50%', top: '50%' }}>
                    {TRAIT_KEYS.map((k, index) => {
                      const angle = START_ANGLE + (index * 2 * Math.PI) / 5
                      const labelR = maxRadius + 90
                      const x = labelR * Math.cos(angle)
                      const y = labelR * Math.sin(angle)
                      return (
                        <div
                          key={k}
                          className="absolute flex flex-col items-center text-center gap-1 text-base sm:text-lg text-white font-semibold drop-shadow-md"
                          style={{
                            left: `${x}px`,
                            top: `${y}px`,
                            transform: 'translate(-50%, -50%)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span className="block">{k}</span>
                          <span className="block font-semibold text-pink-300">
                            {(() => {
                              const info = finalReport[k]
                              const score = info?.score ?? info?.점수 ?? 0
                              return `${Math.round(Number(score) || 0)}`
                            })()}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
                  <p className="text-sm font-semibold text-white">핵심 역량 분석</p>
                  <p className="text-sm text-white/80 mt-2 whitespace-pre-wrap">
                    {(finalReport.overall_summary || '').trim()}
                  </p>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
                  <p className="text-sm font-semibold text-white">잘한 점</p>
                  <ul className="mt-3 space-y-2">
                    {(finalReport.strengths || []).map((t, idx) => (
                      <li key={idx} className="text-sm text-white/80">
                        - {t}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
                  <p className="text-sm font-semibold text-white">다음 단계 개선</p>
                  <ul className="mt-3 space-y-2">
                    {(finalReport.next_steps || []).map((t, idx) => (
                      <li key={idx} className="text-sm text-white/80">
                        - {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
