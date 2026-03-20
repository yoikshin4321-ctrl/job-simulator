'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Award, BarChart3, Briefcase, Users } from 'lucide-react'
import { supabase } from '../../../src/lib/supabaseClient'
import { fetchStepResultsForInstitution, getInstitutionByAdmin, getSupabaseUserId } from '../../../src/lib/supabaseDb'

const AUTH_KEY = 'job_sim_auth'
const HISTORY_KEY = 'job_sim_ai_history'

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

  useEffect(() => {
    if (typeof window === 'undefined') return

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
  }, [])

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

