import React, { useEffect, useMemo, useState } from 'react'
import LoadingOverlay from '../components/LoadingOverlay'

const JOBS = [
  { key: 'PM', label: 'PM' },
  { key: 'DA', label: 'DA' },
  { key: 'Marketer', label: 'Marketer' },
]

function clampLevel(n) {
  if (n <= 1) return 1
  if (n >= 3) return 3
  return n
}

export default function TaskGeneratorPage() {
  const [job, setJob] = useState(null) // 'PM' | 'DA' | 'Marketer' | null
  const [level, setLevel] = useState(1)
  const [task, setTask] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [seed, setSeed] = useState(null)

  const loadingMessage = useMemo(() => {
    if (!job) return '직무를 불러오는 중...'
    if (level >= 3) return `${job} 실무 과제 정밀 생성 중...`
    return `${job} Level ${level} 과제 생성 중...`
  }, [job, level])

  const fetchTask = async (nextJob, nextLevel) => {
    setError('')
    setIsLoading(true)
    try {
      // 캐싱 방지 + 응답 다양성 유도(Seed)
      const nextSeed = Math.floor(Math.random() * 1_000_000_000)
      setSeed(nextSeed)
      const url = `/api/generate?job=${encodeURIComponent(nextJob)}&level=${encodeURIComponent(
        String(nextLevel),
      )}&seed=${encodeURIComponent(String(nextSeed))}&t=${Date.now()}`

      // 디버깅용 로그
      // eslint-disable-next-line no-console
      console.log(
        '서버 호출 시도 중...',
        'job:',
        nextJob,
        'level:',
        nextLevel,
        'seed:',
        nextSeed,
      )

      const res = await fetch(url, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job: nextJob,
          level: nextLevel,
          seed: nextSeed,
          luckyNumber: nextSeed, // 서버 프롬프트에 "오늘의 행운의 숫자"로 활용 가능
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`API ${res.status}: ${text}`)
      }

      const data = await res.json()
      setTask(data)
    } catch (e) {
      setTask(null)
      setError(
        e?.message ||
          '과제를 불러오지 못했습니다. API 서버 상태와 환경 변수를 확인해 주세요.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  // 직무가 선택되면 항상 Level 1부터 시작
  useEffect(() => {
    if (!job) return
    setLevel(1)
    fetchTask(job, 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job])

  const handleNext = async () => {
    const nextLevel = clampLevel(level + 1)
    setLevel(nextLevel)
    await fetchTask(job, nextLevel)
  }

  const canNext = Boolean(job) && Boolean(task) && level < 3 && !isLoading

  return (
    <div className="min-h-screen w-full bg-black text-white px-4 py-10">
      <LoadingOverlay open={isLoading} message={loadingMessage} />

      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] tracking-[0.25em] uppercase text-white/60">
              AI Task Generator
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              직무별 실무 과제
            </h1>
            <p className="text-sm text-white/70 mt-2">
              직무를 선택하면 Level 1부터 시작하고, &quot;다음 단계로&quot;를 누를 때마다 새로운
              과제를 생성합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {JOBS.map((j) => (
              <button
                key={j.key}
                type="button"
                onClick={() => setJob(j.key)}
                className={[
                  'px-3 py-2 rounded-xl border text-sm font-semibold transition-all',
                  job === j.key
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-white border-white/20 hover:border-white/60 hover:bg-white/10',
                ].join(' ')}
              >
                {j.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-2xl shadow-indigo-500/10">
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 border border-indigo-400/40 text-white">
                {job ? `${job} · Level ${level}` : '직무 선택 필요'}
              </span>
              {seed != null && (
                <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white/70">
                  오늘의 행운의 숫자: {seed}
                </span>
              )}
              {task?.task_title && (
                <p className="text-sm sm:text-base font-bold text-white">
                  {task.task_title}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTask(null)
                  setError('')
                  setJob(null)
                  setLevel(1)
                }}
                className="px-3 py-2 rounded-xl border border-white/20 text-xs font-semibold text-white/80 hover:text-white hover:border-white/60 hover:bg-white/10 transition-all"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!canNext}
                className="px-3 py-2 rounded-xl bg-indigo-500 text-white text-xs font-semibold hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                다음 단계로
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {!job && (
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <p className="text-white/80 text-sm">
                  위에서 직무(PM/DA/Marketer)를 선택하면 Level 1 과제가 생성됩니다.
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-5">
                <p className="text-sm font-semibold text-rose-200 mb-1">불러오기 실패</p>
                <p className="text-sm text-white/80 whitespace-pre-wrap">{error}</p>
                <p className="text-xs text-white/50 mt-3">
                  참고: 이 컴포넌트는 동일 도메인에서 `POST /api/task`가 동작한다는 전제로 동작합니다.
                </p>
              </div>
            )}

            {job && task && !error && (
              <>
                <section className="space-y-2">
                  <h2 className="text-sm font-semibold text-white">상황</h2>
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                    {task.situation}
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-sm font-semibold text-white">요구사항</h2>
                  <ul className="space-y-2">
                    {(task.requirements || []).map((it, idx) => (
                      <li
                        // eslint-disable-next-line react/no-array-index-key
                        key={idx}
                        className="flex gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3"
                      >
                        <span className="text-white/60 text-xs font-semibold mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-white/85">{it}</p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-2">
                  <h2 className="text-sm font-semibold text-white">제약조건</h2>
                  <ul className="space-y-2">
                    {(task.constraints || []).map((it, idx) => (
                      <li
                        // eslint-disable-next-line react/no-array-index-key
                        key={idx}
                        className="flex gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3"
                      >
                        <span className="text-white/60 text-xs font-semibold mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-white/85">{it}</p>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-2">
                  <h2 className="text-sm font-semibold text-white">힌트</h2>
                  <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-3">
                    <p className="text-sm text-white/85">{task.hint}</p>
                  </div>
                </section>

                {level >= 3 && (
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3">
                    <p className="text-sm font-semibold text-emerald-200">
                      Level 3 완료
                    </p>
                    <p className="text-sm text-white/80 mt-1">
                      팀장급 과제까지 완료했습니다. 직무를 다시 선택해 다른 트랙을 도전해보세요.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

