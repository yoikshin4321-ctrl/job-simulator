'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Search, X, Download } from 'lucide-react'
import { supabase } from '../../../src/lib/supabaseClient'
import {
  fetchFeatureActivityEventsForInstitution,
  fetchStepResultsForInstitution,
  getInstitutionByAdmin,
  getSupabaseUserId,
} from '../../../src/lib/supabaseDb'
import { loadLocalFeatureEventsForInstitution } from '../../../src/lib/featureActivity'

const AUTH_KEY = 'job_sim_auth'
const HISTORY_KEY = 'job_sim_ai_history'

const TRAIT_KEYS = ['문제해결력', '커뮤니케이션', '직무이해력', '완수율', '전문지식'] as const
type TraitKey = (typeof TRAIT_KEYS)[number]

type HistoryEntry = {
  roleId?: string
  levelIndex?: number
  levelLabel?: string
  analyzedAt?: string
  studentEmail?: string
  studentName?: string
  institutionCode?: string
  runId?: string
  result?: any
}

type FeatureEventType = 'career_test_completed' | 'mentor_question_submitted' | 'pick_viewed' | 'vod_watched_completed'
type FeatureEvent = {
  id?: string
  userId?: string
  institutionCode?: string
  studentEmail: string
  studentName: string
  eventType: FeatureEventType | string
  occurredAt: string
  durationSeconds?: number
  meta?: Record<string, any>
}

function avg(nums: number[]) {
  if (!nums.length) return 0
  return nums.reduce((s, n) => s + n, 0) / nums.length
}

function safeParseJson(raw: string | null): any {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function getTraitAvgFromHistory(h: HistoryEntry): number | null {
  const r = h.result
  if (!r || typeof r !== 'object') return null
  const traitScores = TRAIT_KEYS.map((k) => {
    const block = (r as any)[k]
    const score = block?.score ?? block?.점수
    return typeof score === 'number' ? score : null
  }).filter((x): x is number => x !== null)
  if (!traitScores.length) return null
  return Math.round(avg(traitScores))
}

function getTraitAveragesFromHistories(histories: HistoryEntry[]): Record<TraitKey, number> {
  const sums = {} as Record<TraitKey, number>
  const ns = {} as Record<TraitKey, number>
  TRAIT_KEYS.forEach((k) => {
    sums[k] = 0
    ns[k] = 0
  })

  histories.forEach((h) => {
    const r = h.result
    if (!r || typeof r !== 'object') return
    TRAIT_KEYS.forEach((k) => {
      const block = (r as any)[k]
      const score = block?.score ?? block?.점수
      if (typeof score === 'number') {
        sums[k] += score
        ns[k] += 1
      }
    })
  })

  const out = {} as Record<TraitKey, number>
  TRAIT_KEYS.forEach((k) => {
    out[k] = ns[k] > 0 ? Math.round(sums[k] / ns[k]) : 0
  })
  return out
}

export default function InstitutionStudentsPage() {
  const router = useRouter()
  const [institution, setInstitution] = useState<null | { institutionName?: string; institutionCode?: string }>(null)
  const [histories, setHistories] = useState<HistoryEntry[]>([])
  const [featureEvents, setFeatureEvents] = useState<FeatureEvent[]>([])
  const [featureLoading, setFeatureLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string>('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const load = async () => {
      // 1) institution
      const raw = window.localStorage.getItem(AUTH_KEY)
      const parsed = safeParseJson(raw)
      const currentInstitution = parsed?.currentInstitution
      const instCode = currentInstitution?.institutionCode ?? currentInstitution?.institution_code
      const instName = currentInstitution?.institutionName ?? currentInstitution?.institution_name

      if (instCode || instName) {
        setInstitution({ institutionCode: instCode || '', institutionName: instName || '기관' })
      }

      // 2) supabase로 더 정확한 데이터 우선
      if (supabase) {
        const userId = await getSupabaseUserId()
        if (userId) {
          const instRow = await getInstitutionByAdmin(userId)
          if (instRow?.institution_code) {
            setInstitution({ institutionCode: instRow.institution_code, institutionName: instRow.institution_name })
            const rows = await fetchStepResultsForInstitution({ institutionCode: instRow.institution_code })
            setHistories(rows as any)
            const localEvents = loadLocalFeatureEventsForInstitution(instRow.institution_code) as FeatureEvent[]
            setFeatureLoading(true)
            try {
              const rows2 = (await fetchFeatureActivityEventsForInstitution({ institutionCode: instRow.institution_code })) as any[]
              setFeatureEvents(rows2.length ? (rows2 as FeatureEvent[]) : localEvents)
            } catch {
              setFeatureEvents(localEvents)
            } finally {
              setFeatureLoading(false)
            }
            setChecked(true)
            return
          }
        }
      }

      // 3) supabase 미설정/실패 시 local fallback
      const historyRaw = window.localStorage.getItem(HISTORY_KEY)
      const parsedHistory = safeParseJson(historyRaw) || []
      setHistories(parsedHistory)

      const code = instCode || ''
      if (code) {
        const localEvents = loadLocalFeatureEventsForInstitution(code) as FeatureEvent[]
        setFeatureEvents(localEvents)
      }

      setChecked(true)
    }

    void load()
  }, [])

  const myHistories = useMemo(() => {
    const code = institution?.institutionCode || ''
    if (!code) return []
    return histories.filter((h) => (h.institutionCode || '') === code)
  }, [histories, institution?.institutionCode])

  const myFeatureEvents = useMemo(() => {
    const code = institution?.institutionCode || ''
    if (!code) return []
    return featureEvents.filter((e) => (e.institutionCode || '') === code)
  }, [featureEvents, institution?.institutionCode])

  const aggregatedStudents = useMemo(() => {
    const map = new Map<
      string,
      {
        email: string
        name: string
        runIds: Set<string>
        submissions: number
        traitAvgVals: number[]
      }
    >()

    myHistories.forEach((h) => {
      const email = h.studentEmail || 'unknown'
      const name = h.studentName || email
      const runId = h.runId || `${email}-${h.analyzedAt || ''}`
      if (!map.has(email)) {
        map.set(email, {
          email,
          name,
          runIds: new Set<string>([runId]),
          submissions: 0,
          traitAvgVals: [],
        })
      }
      const s = map.get(email)!
      s.runIds.add(runId)
      s.submissions += 1
      const traitAvg = getTraitAvgFromHistory(h)
      if (typeof traitAvg === 'number') s.traitAvgVals.push(traitAvg)
    })

    const students = Array.from(map.values()).map((s) => {
      const overallAvg = s.traitAvgVals.length ? Math.round(avg(s.traitAvgVals)) : 0
      return {
        email: s.email,
        name: s.name,
        runCount: s.runIds.size,
        submissionCount: s.submissions,
        overallAvg,
      }
    })

    const filtered = search.trim()
      ? students.filter((s) => s.name.includes(search.trim()) || s.email.includes(search.trim()))
      : students

    return filtered.sort((a, b) => b.overallAvg - a.overallAvg)
  }, [myHistories, search])

  const selectedHistories = useMemo(() => {
    if (!selectedStudentEmail) return []
    return myHistories
      .filter((h) => (h.studentEmail || '') === selectedStudentEmail)
      .sort((a, b) => (b.analyzedAt || '').localeCompare(a.analyzedAt || ''))
  }, [myHistories, selectedStudentEmail])

  const selectedSummary = useMemo(() => {
    if (!selectedStudentEmail || !selectedHistories.length) return null
    const runIds = new Set(selectedHistories.map((h) => h.runId || ''))
    const runCount = Array.from(runIds).filter(Boolean).length
    const submissionCount = selectedHistories.length

    const traitAvgVals = selectedHistories.map(getTraitAvgFromHistory).filter((x): x is number => typeof x === 'number')
    const overallAvg = traitAvgVals.length ? Math.round(avg(traitAvgVals)) : 0

    const traitAverages = getTraitAveragesFromHistories(selectedHistories)
    const lowest = TRAIT_KEYS.reduce(
      (acc, k) => {
        const v = traitAverages[k]
        return v < acc.value ? { key: k, value: v } : acc
      },
      { key: TRAIT_KEYS[0], value: traitAverages[TRAIT_KEYS[0]] },
    )

    return {
      email: selectedStudentEmail,
      name: selectedHistories[0]?.studentName || selectedStudentEmail,
      runCount,
      submissionCount,
      overallAvg,
      counselorPriority: lowest.key,
    }
  }, [selectedStudentEmail, selectedHistories])

  const selectedFeatureCounts = useMemo(() => {
    if (!selectedStudentEmail) return null
    const events = myFeatureEvents.filter((e) => e.studentEmail === selectedStudentEmail)
    const careerTestCount = events.filter((e) => e.eventType === 'career_test_completed').length
    const mentorQuestionCount = events.filter((e) => e.eventType === 'mentor_question_submitted').length
    const pickViewedCount = events.filter((e) => e.eventType === 'pick_viewed').length
    const vodEvents = events.filter((e) => e.eventType === 'vod_watched_completed')
    const vodWatchedCount = vodEvents.length
    const vodWatchSeconds = vodEvents.reduce((s, e) => s + Number(e.durationSeconds || 0), 0)
    const recent = events.slice().sort((a, b) => (b.occurredAt || '').localeCompare(a.occurredAt || '')).slice(0, 10)
    return { careerTestCount, mentorQuestionCount, pickViewedCount, vodWatchedCount, vodWatchSeconds, recent }
  }, [selectedStudentEmail, myFeatureEvents])

  if (!checked) return null

  if (!institution) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] w-full flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-lg font-bold text-slate-900 mb-2">기관용 화면</h1>
          <p className="text-sm text-slate-600 mb-5">기관 로그인이 필요합니다.</p>
          <button
            type="button"
            onClick={() => router.push('/institution-login')}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            기관 로그인 하러가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] w-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.18em] mb-2">Institution</p>
            <h1 className="text-2xl font-bold text-slate-900">{institution.institutionName || '기관'} · 학생 현황</h1>
            <p className="text-sm text-slate-600 mt-2">
              기관 코드: <span className="font-semibold text-slate-800">{institution.institutionCode}</span>
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Link
              href="/institution/counseling-guides"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              상담 가이드
            </Link>
            <Link
              href="/institution/dashboard"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              대시보드
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900">학생별 참여 현황</h2>
              <p className="text-xs text-slate-500 mt-1">학생 이름/이메일을 검색해 상세 정보를 확인할 수 있습니다.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="학생 검색"
                  className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            {aggregatedStudents.length === 0 ? (
              <p className="text-sm text-slate-600 py-6">아직 이 기관 코드로 생성된 학생 활동 데이터가 없습니다.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-200">
                    <th className="py-3 px-3 font-semibold text-slate-700">학생</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">시뮬레이션 수</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">평가(제출) 횟수</th>
                    <th className="py-3 px-3 font-semibold text-slate-700">평균 준비도</th>
                    <th className="py-3 px-3 font-semibold text-slate-700 text-right"> </th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatedStudents.map((s) => (
                    <tr key={s.email} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.email}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{s.runCount}</td>
                      <td className="py-3 px-3 text-slate-700">{s.submissionCount}</td>
                      <td className="py-3 px-3 text-indigo-700 font-extrabold">{s.overallAvg}점</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedStudentEmail(s.email)}
                          className="inline-flex items-center justify-center px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-indigo-200 transition-colors"
                        >
                          상세 보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {selectedSummary && selectedFeatureCounts && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">학생 상세 · {selectedSummary.name}</h2>
                <p className="text-xs text-slate-500 mt-1">{selectedSummary.email}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                  시뮬레이션 {selectedSummary.runCount}회
                </span>
                <span className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                  제출/평가 {selectedSummary.submissionCount}회
                </span>
                <span className="px-3 py-2 rounded-xl bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200">
                  평균 준비도 {selectedSummary.overallAvg}점
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedStudentEmail('')}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-600">상담 우선순위(예상)</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">{selectedSummary.counselorPriority}</p>
                <p className="text-xs text-slate-500 mt-1">해당 학생의 최근 기록 기준으로 평균 점수가 가장 낮은 항목을 우선으로 안내합니다.</p>
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-600">최근 기능 활동</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-white border border-slate-200 py-3">
                    <p className="text-[11px] text-slate-500">진로검사</p>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">{selectedFeatureCounts.careerTestCount}회</p>
                  </div>
                  <div className="rounded-xl bg-white border border-slate-200 py-3">
                    <p className="text-[11px] text-slate-500">멘토질문</p>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">{selectedFeatureCounts.mentorQuestionCount}회</p>
                  </div>
                  <div className="rounded-xl bg-white border border-slate-200 py-3">
                    <p className="text-[11px] text-slate-500">Pick 열람</p>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">{selectedFeatureCounts.pickViewedCount}회</p>
                  </div>
                  <div className="rounded-xl bg-white border border-slate-200 py-3">
                    <p className="text-[11px] text-slate-500">VOD</p>
                    <p className="text-lg font-extrabold text-slate-900 mt-1">{selectedFeatureCounts.vodWatchedCount}회</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">총 시청 {Math.round(selectedFeatureCounts.vodWatchSeconds / 60)}분</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-900">최근 활동 로그</h3>
                <button
                  type="button"
                  onClick={() => {
                    // 향후: 엑셀 내보내기 확장 포인트
                    // 현재는 UI 가이드용(실제 다운로드는 dashboard에서 제공)
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4 inline-block mr-2" />
                  엑셀(예정)
                </button>
              </div>
              {featureLoading ? (
                <p className="text-xs text-slate-500 mt-2">활동을 불러오는 중입니다...</p>
              ) : selectedFeatureCounts.recent.length === 0 ? (
                <p className="text-xs text-slate-500 mt-2">최근 기능 활동 데이터가 없습니다.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {selectedFeatureCounts.recent.map((e) => (
                    <div key={e.id || `${e.eventType}-${e.occurredAt}`} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{e.eventType}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{e.occurredAt ? e.occurredAt.slice(0, 10) : ''}</p>
                      </div>
                      {typeof e.durationSeconds === 'number' && e.durationSeconds > 0 ? (
                        <p className="text-[11px] text-indigo-700 font-semibold shrink-0">
                          시청 {Math.round(e.durationSeconds / 60)}분
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

