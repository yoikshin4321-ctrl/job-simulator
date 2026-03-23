'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Award, BarChart3, Briefcase, Users } from 'lucide-react'
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
// 학생 모듈(진로검사/멘토/픽/VOD) 활동 이벤트

const TRAIT_KEYS = ['문제해결력', '커뮤니케이션', '직무이해력', '완수율', '전문지식'] as const

type TraitKey = (typeof TRAIT_KEYS)[number]

type HistoryEntry = {
  roleId?: string
  levelIndex?: number
  levelLabel?: string
  answer?: string
  result?: any
  analyzedAt?: string
  // B2B 확장 필드(없어도 동작하지만 필터링에 필요)
  studentEmail?: string
  studentName?: string
  institutionCode?: string
  runId?: string
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

function safeParseJson(raw: string | null): any {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function avg(nums: number[]) {
  if (!nums.length) return 0
  return nums.reduce((s, n) => s + n, 0) / nums.length
}

export default function InstitutionDashboardPage() {
  const [institution, setInstitution] = useState<null | {
    institutionName?: string
    institutionCode?: string
    adminEmail?: string
  }>(null)
  const [histories, setHistories] = useState<HistoryEntry[]>([])
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string>('')
  const [featureEvents, setFeatureEvents] = useState<FeatureEvent[]>([])
  const [featureLoading, setFeatureLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadFeatureEvents = async (institutionCode: string) => {
      setFeatureLoading(true)
      const localEvents = loadLocalFeatureEventsForInstitution(institutionCode) as FeatureEvent[]

      // Supabase 우선, 실패 시 localStorage fallback
      if (supabase) {
        try {
          const rows = (await fetchFeatureActivityEventsForInstitution({ institutionCode })) as FeatureEvent[]
          // Supabase가 비어있어도 로컬에 값이 있다면 보여주기 위함
          setFeatureEvents(rows.length ? rows : localEvents)
        } catch {
          setFeatureEvents(localEvents)
        } finally {
          setFeatureLoading(false)
        }
        return
      }

      setFeatureEvents(localEvents)
      setFeatureLoading(false)
    }

    // 1) Supabase 우선 로딩 (멀티디바이스 대응)
    if (supabase) {
      ;(async () => {
        const userId = await getSupabaseUserId()
        if (!userId) return

        const inst = await getInstitutionByAdmin(userId)
        if (!inst?.institution_code) return

        setInstitution({
          institutionName: inst.institution_name,
          institutionCode: inst.institution_code,
          adminEmail: '', // UI 상단에선 없어도 동작
        })

        const rows = await fetchStepResultsForInstitution({ institutionCode: inst.institution_code })
        setHistories(rows as any)

        void loadFeatureEvents(inst.institution_code)
      })().catch(() => {
        // ignore: fallback은 아래 localStorage 코드로 처리
      })
    }

    const raw = window.localStorage.getItem(AUTH_KEY)
    const parsed = safeParseJson(raw)
    const currentInstitution = parsed?.currentInstitution
    if (!currentInstitution?.institutionCode) return
    setInstitution({
      institutionName: currentInstitution.institutionName,
      institutionCode: currentInstitution.institutionCode,
      adminEmail: currentInstitution.adminEmail,
    })

    const historyRaw = window.localStorage.getItem(HISTORY_KEY)
    const parsedHistory: HistoryEntry[] = safeParseJson(historyRaw) || []
    setHistories(parsedHistory)

    const currentInstitutionCode = currentInstitution?.institutionCode || ''
    if (currentInstitutionCode) void loadFeatureEvents(currentInstitutionCode)
  }, [])

  // 로컬 이벤트 기반 “실시간” 갱신 (학생 모듈에서 localStorage에 즉시 기록되기 때문)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const code = institution?.institutionCode
    if (!code) return

    const id = window.setInterval(() => {
      void (async () => {
        if (supabase) {
          try {
            const rows = (await fetchFeatureActivityEventsForInstitution({ institutionCode: code })) as FeatureEvent[]
            setFeatureEvents(rows)
            return
          } catch {
            // fallthrough -> local
          }
        }
        const localEvents = loadLocalFeatureEventsForInstitution(code) as FeatureEvent[]
        setFeatureEvents(localEvents)
      })()
    }, 20000)

    return () => window.clearInterval(id)
  }, [institution?.institutionCode])

  const myHistories = useMemo(() => {
    if (!institution?.institutionCode) return []
    return histories.filter((h) => (h.institutionCode || '') === institution.institutionCode)
  }, [histories, institution?.institutionCode])

  const selectedHistories = useMemo(() => {
    if (!selectedStudentEmail) return []
    return myHistories
      .filter((h) => (h.studentEmail || '') === selectedStudentEmail)
      .sort((a, b) => (b.analyzedAt || '').localeCompare(a.analyzedAt || ''))
  }, [myHistories, selectedStudentEmail])

  const featureTotals = useMemo(() => {
    const totals = {
      careerTestCount: 0,
      mentorQuestionCount: 0,
      mentorAnsweredCount: 0,
      pickViewedCount: 0,
      vodWatchedCount: 0,
      vodWatchSeconds: 0,
    }

    featureEvents.forEach((e) => {
      if (e.eventType === 'career_test_completed') totals.careerTestCount += 1
      if (e.eventType === 'mentor_question_submitted') {
        totals.mentorQuestionCount += 1
        if (e.meta?.answered === true) totals.mentorAnsweredCount += 1
      }
      if (e.eventType === 'pick_viewed') totals.pickViewedCount += 1
      if (e.eventType === 'vod_watched_completed') {
        totals.vodWatchedCount += 1
        totals.vodWatchSeconds += Number(e.durationSeconds || 0)
      }
    })

    return totals
  }, [featureEvents])

  const selectedStudentFeatureEvents = useMemo(() => {
    if (!selectedStudentEmail) return []
    return featureEvents
      .filter((e) => (e.studentEmail || '') === selectedStudentEmail)
      .sort((a, b) => (b.occurredAt || '').localeCompare(a.occurredAt || ''))
  }, [featureEvents, selectedStudentEmail])

  const downloadCsv = (filename: string, rows: Record<string, any>[]) => {
    const headers = Object.keys(rows[0] || {})
    const escape = (v: any) => {
      const s = v == null ? '' : String(v)
      // CSV 규격: 따옴표 포함/콤마 포함이면 감싸기
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
      return s
    }
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportStudentSummaryCsv = () => {
    if (!featureEvents.length) return
    const map = new Map<
      string,
      {
        studentEmail: string
        studentName: string
        careerTestCount: number
        mentorQuestionCount: number
        mentorAnsweredCount: number
        pickViewedCount: number
        vodWatchedCount: number
        vodWatchSeconds: number
      }
    >()

    featureEvents.forEach((e) => {
      const key = e.studentEmail
      if (!map.has(key)) {
        map.set(key, {
          studentEmail: e.studentEmail,
          studentName: e.studentName,
          careerTestCount: 0,
          mentorQuestionCount: 0,
          mentorAnsweredCount: 0,
          pickViewedCount: 0,
          vodWatchedCount: 0,
          vodWatchSeconds: 0,
        })
      }
      const s = map.get(key)!
      if (e.eventType === 'career_test_completed') s.careerTestCount += 1
      if (e.eventType === 'mentor_question_submitted') {
        s.mentorQuestionCount += 1
        if (e.meta?.answered === true) s.mentorAnsweredCount += 1
      }
      if (e.eventType === 'pick_viewed') s.pickViewedCount += 1
      if (e.eventType === 'vod_watched_completed') {
        s.vodWatchedCount += 1
        s.vodWatchSeconds += Number(e.durationSeconds || 0)
      }
    })

    const rows = Array.from(map.values()).sort((a, b) => b.vodWatchSeconds - a.vodWatchSeconds)
    downloadCsv(`institution-student-activity-${institution?.institutionCode || 'unknown'}.csv`, rows)
  }

  const exportMonthlySummaryCsv = () => {
    if (!featureEvents.length) return
    const map = new Map<string, any>()

    const monthKey = (iso: string) => (iso || '').slice(0, 7) // YYYY-MM

    featureEvents.forEach((e) => {
      const m = monthKey(e.occurredAt)
      const key = `${m}|${e.studentEmail}`
      if (!map.has(key)) {
        map.set(key, {
          month: m,
          studentEmail: e.studentEmail,
          studentName: e.studentName,
          careerTestCount: 0,
          mentorQuestionCount: 0,
          mentorAnsweredCount: 0,
          pickViewedCount: 0,
          vodWatchedCount: 0,
          vodWatchSeconds: 0,
        })
      }
      const s = map.get(key)
      if (e.eventType === 'career_test_completed') s.careerTestCount += 1
      if (e.eventType === 'mentor_question_submitted') {
        s.mentorQuestionCount += 1
        if (e.meta?.answered === true) s.mentorAnsweredCount += 1
      }
      if (e.eventType === 'pick_viewed') s.pickViewedCount += 1
      if (e.eventType === 'vod_watched_completed') {
        s.vodWatchedCount += 1
        s.vodWatchSeconds += Number(e.durationSeconds || 0)
      }
    })

    const rows = Array.from(map.values()).sort((a, b) => (a.month || '').localeCompare(b.month || ''))
    downloadCsv(`institution-monthly-activity-${institution?.institutionCode || 'unknown'}.csv`, rows)
  }

  const getTraitAvgFromHistory = (h: HistoryEntry): number | null => {
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

  const selectedStudentSummary = useMemo(() => {
    if (!selectedStudentEmail) return null
    const runIds = new Set(selectedHistories.map((h) => h.runId || ''))
    const runCount = Array.from(runIds).filter(Boolean).length
    const submissionCount = selectedHistories.length
    const traitAvgVals = selectedHistories.map(getTraitAvgFromHistory).filter((x): x is number => x !== null)
    const overallAvg = traitAvgVals.length ? Math.round(avg(traitAvgVals)) : 0
    const name = selectedHistories[0]?.studentName || selectedStudentEmail

    return {
      email: selectedStudentEmail,
      name,
      runCount,
      submissionCount,
      overallAvg,
    }
  }, [selectedHistories, selectedStudentEmail])

  const selectedByRoleLevel = useMemo(() => {
    if (!selectedStudentEmail) return []
    const map = new Map<string, { roleId: string; levelIndex: number; submissions: number; sum: number; n: number }>()

    selectedHistories.forEach((h) => {
      const roleId = h.roleId || 'unknown'
      const levelIndex = typeof h.levelIndex === 'number' ? h.levelIndex : 0
      const key = `${roleId}-${levelIndex}`
      if (!map.has(key)) {
        map.set(key, { roleId, levelIndex, submissions: 0, sum: 0, n: 0 })
      }
      const bucket = map.get(key)!
      bucket.submissions += 1
      const traitAvg = getTraitAvgFromHistory(h)
      if (typeof traitAvg === 'number') {
        bucket.sum += traitAvg
        bucket.n += 1
      }
    })

    return Array.from(map.values()).map((v) => ({
      roleId: v.roleId,
      levelIndex: v.levelIndex,
      submissions: v.submissions,
      avgScore: v.n > 0 ? Math.round(v.sum / v.n) : 0,
    }))
  }, [selectedHistories, selectedStudentEmail])

  const aggregated = useMemo(() => {
    const studentMap = new Map<
      string,
      {
        email: string
        name: string
        runIds: Set<string>
        submissions: number
        traitScoresSum: Record<TraitKey, number>
        traitScoresN: Record<TraitKey, number>
      }
    >()

    const allRunIds = new Set<string>()

    myHistories.forEach((h) => {
      const email = h.studentEmail || 'unknown'
      const name = h.studentName || email
      const runId = h.runId || `${email}-${h.analyzedAt || ''}-${h.levelIndex || ''}`

      allRunIds.add(runId)

      if (!studentMap.has(email)) {
        studentMap.set(email, {
          email,
          name,
          runIds: new Set<string>([runId]),
          submissions: 0,
          traitScoresSum: { 문제해결력: 0, 커뮤니케이션: 0, 직무이해력: 0, 완수율: 0, 전문지식: 0 },
          traitScoresN: { 문제해결력: 0, 커뮤니케이션: 0, 직무이해력: 0, 완수율: 0, 전문지식: 0 },
        })
      }

      const s = studentMap.get(email)!
      s.runIds.add(runId)
      s.submissions += 1

      const result = h.result
      if (result && typeof result === 'object') {
        TRAIT_KEYS.forEach((k) => {
          const block = result[k] as { score?: number } | undefined
          const score = block?.score
          if (typeof score === 'number') {
            s.traitScoresSum[k] += score
            s.traitScoresN[k] += 1
          }
        })
      }
    })

    const students = Array.from(studentMap.values()).map((s) => {
      const perTraitAvg = TRAIT_KEYS.map((k) => {
        const n = s.traitScoresN[k]
        return n > 0 ? s.traitScoresSum[k] / n : 0
      })
      return {
        email: s.email,
        name: s.name,
        runs: s.runIds.size,
        submissions: s.submissions,
        avgScore: Math.round(avg(perTraitAvg)),
      }
    })

    const overallTraitAvg = TRAIT_KEYS.map((k) => {
      const vals: number[] = []
      students.forEach((st) => {
        // student별 avgScore만 갖고 있으므로 trait별 정밀 평균은 생략
        // UI에서는 전체 평균만 제공
        void st
      })
      vals.push(0)
      return avg(vals)
    })

    const overallAvg = Math.round(
      students.length
        ? avg(
            students.map((s) => s.avgScore || 0).filter((n) => typeof n === 'number' && !Number.isNaN(n)),
          )
        : 0,
    )

    return {
      studentCount: students.length,
      runCount: allRunIds.size,
      submissionCount: myHistories.length,
      students,
      overallAvg,
      // overallTraitAvg는 현재 로직상 생략
      overallTraitAvg,
    }
  }, [myHistories])

  if (!institution) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] w-full flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h1 className="text-lg font-bold text-slate-900 mb-2">기관 대시보드</h1>
          <p className="text-sm text-slate-600 mb-5">
            먼저 <span className="font-semibold">기관 로그인</span>이 필요합니다.
          </p>
          <Link
            href="/institution-login"
            className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all"
          >
            기관 로그인 하러가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] w-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.18em] mb-2">
              Institution Dashboard
            </p>
            <h1 className="text-2xl font-bold text-slate-900">{institution.institutionName || '기관'}</h1>
            <p className="text-sm text-slate-600 mt-2">
              기관 코드: <span className="font-semibold text-slate-800">{institution.institutionCode}</span>
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Link
              href="/simulation"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              시뮬레이션 화면 보기
            </Link>
            <Link
              href="/institution/counseling-guides"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              상담 가이드
            </Link>
            <Link
              href="/institution/students"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              학생 현황
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">참여 학생 수</p>
                <p className="text-2xl font-extrabold text-slate-900">{aggregated.studentCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">시뮬레이션 진행 수</p>
                <p className="text-2xl font-extrabold text-slate-900">{aggregated.runCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">제출/평가 횟수</p>
                <p className="text-2xl font-extrabold text-slate-900">{aggregated.submissionCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">평균 준비도</p>
                <p className="text-2xl font-extrabold text-slate-900">{aggregated.overallAvg}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 기능별 트래킹 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">기능별 트래킹</h2>
              <p className="text-xs text-slate-500 mt-1">AI 진로검사 / 멘토 질문 / Pick / VOD 활동 집계</p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={exportMonthlySummaryCsv}
                disabled={!featureEvents.length}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                월별 활동 엑셀(CSV)
              </button>
              <button
                type="button"
                onClick={exportStudentSummaryCsv}
                disabled={!featureEvents.length}
                className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                학생별 활동 엑셀(CSV)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-600">AI 진로검사</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{featureTotals.careerTestCount}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-600">멘토 질문</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{featureTotals.mentorQuestionCount}</p>
              <p className="text-[11px] text-slate-500 mt-1">답변 완료 {featureTotals.mentorAnsweredCount}건</p>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-600">Pick 열람</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{featureTotals.pickViewedCount}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-600">VOD</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{featureTotals.vodWatchedCount}</p>
              <p className="text-[11px] text-slate-500 mt-1">시청 {Math.round(featureTotals.vodWatchSeconds / 60)}분</p>
            </div>
          </div>

          {featureLoading && <p className="text-xs text-slate-500 mt-3">기능 활동을 불러오는 중입니다...</p>}
          {!featureLoading && !featureEvents.length && (
            <p className="text-xs text-slate-500 mt-3">아직 기능 활동 데이터가 없습니다. 학생이 각 모듈을 이용하면 집계됩니다.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-3">학생별 참여 현황</h2>
          {aggregated.students.length === 0 ? (
            <p className="text-sm text-slate-600">
              아직 이 기관 코드로 생성된 데이터가 없습니다. 학생들에게 기관 코드를 입력하게 해 주세요.
            </p>
          ) : (
            <div className="overflow-x-auto">
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
                  {aggregated.students
                    .sort((a, b) => b.avgScore - a.avgScore)
                    .map((s) => (
                      <tr key={s.email} className="border-b border-slate-100 last:border-b-0">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{s.name}</div>
                          <div className="text-xs text-slate-500">{s.email}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{s.runs}</td>
                        <td className="py-3 px-3 text-slate-700">{s.submissions}</td>
                        <td className="py-3 px-3 font-extrabold text-indigo-700">{s.avgScore}</td>
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
            </div>
          )}
        </div>

        {/* 학생 상세 */}
        {selectedStudentEmail && selectedStudentSummary && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mt-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  학생 상세 · {selectedStudentSummary.name}
                </h2>
                <p className="text-xs text-slate-500 mt-1">{selectedStudentSummary.email}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                  시뮬레이션 {selectedStudentSummary.runCount}회
                </span>
                <span className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                  제출/평가 {selectedStudentSummary.submissionCount}회
                </span>
                <span className="px-3 py-2 rounded-xl bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200">
                  평균 준비도 {selectedStudentSummary.overallAvg}점
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

            {/* 학생별 기능 활동 */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">학생 기능 활동</h3>
                  <p className="text-xs text-slate-500 mt-1">{selectedStudentSummary.name} · 최근 기록</p>
                </div>
                <div className="text-xs text-slate-600">
                  {selectedStudentFeatureEvents.length}건
                </div>
              </div>

              {selectedStudentFeatureEvents.length === 0 ? (
                <p className="text-sm text-slate-600">아직 이 학생의 기능 활동 데이터가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {selectedStudentFeatureEvents.slice(0, 10).map((e) => (
                    <div
                      key={`${e.id || e.occurredAt}-${e.eventType}`}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {e.eventType === 'career_test_completed'
                            ? 'AI 진로검사'
                            : e.eventType === 'mentor_question_submitted'
                              ? '멘토 질문'
                              : e.eventType === 'pick_viewed'
                                ? 'Pick 열람'
                                : 'VOD 시청'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 truncate">
                          {new Date(e.occurredAt).toLocaleString()}
                        </p>
                      </div>
                      {e.eventType === 'vod_watched_completed' ? (
                        <p className="text-xs font-bold text-indigo-700 whitespace-nowrap">
                          {Math.round(Number(e.durationSeconds || 0) / 60)}분
                        </p>
                      ) : e.eventType === 'mentor_question_submitted' ? (
                        <div className="flex flex-col sm:items-end">
                          <p className="text-xs font-bold text-indigo-700 whitespace-nowrap">
                            답변 {e.meta?.answered === true ? '완료' : '대기'}
                          </p>
                          {e.meta?.domain && (
                            <p className="text-[11px] text-slate-500 whitespace-nowrap">{e.meta.domain}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-indigo-700 whitespace-nowrap">기록 있음</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">직무/레벨별 요약</h3>
                {selectedByRoleLevel.length === 0 ? (
                  <p className="text-sm text-slate-600">아직 평가 데이터가 없습니다.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedByRoleLevel.map((row) => (
                      <div
                        key={`${row.roleId}-${row.levelIndex}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                            {row.roleId.toUpperCase()} · Level {row.levelIndex}
                          </p>
                          <p className="text-[11px] text-slate-500">제출 {row.submissions}회</p>
                        </div>
                        <p className="text-sm font-extrabold text-indigo-700 tabular-nums">{row.avgScore}점</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-slate-900 mb-3">제출 내역</h3>
                <div className="space-y-2">
                  {selectedHistories.slice(0, 8).map((h, idx) => {
                    const avgScore = getTraitAvgFromHistory(h)
                    return (
                      <div
                        key={`${h.runId || selectedStudentEmail}-${h.analyzedAt || idx}`}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900">
                              {h.roleId || 'unknown'} · Level {h.levelIndex ?? '—'}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {h.levelLabel || '과제명 없음'}
                            </p>
                          </div>
                          <p className="text-xs sm:text-sm font-extrabold text-indigo-700 tabular-nums">
                            {typeof avgScore === 'number' ? `${avgScore}점` : '—'}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {h.analyzedAt ? new Date(h.analyzedAt).toLocaleString() : ''}
                        </p>
                      </div>
                    )
                  })}
                </div>
                {selectedHistories.length > 8 && (
                  <p className="text-[11px] text-slate-500 mt-3">최신 8개까지만 표시합니다.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

