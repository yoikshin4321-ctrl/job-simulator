'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { notifyAuthStorageUpdated } from '../../src/lib/authEvents'
import { requestNavAuthRefresh } from '../../src/lib/navAuthSync'
import { supabase } from '../../src/lib/supabaseClient'
import { fetchStepResultsForUser, getProfileByUserId, getSupabaseUserId, updateStudentInterests } from '../../src/lib/supabaseDb'

const AUTH_KEY = 'job_sim_auth'
const HISTORY_KEY = 'job_sim_ai_history'

const INTEREST_OPTIONS = ['PM', '데이터 분석', '마케팅', '디자인'] as const
type InterestOption = (typeof INTEREST_OPTIONS)[number]

const TRAIT_KEYS = ['문제해결력', '커뮤니케이션', '직무이해력', '완수율', '전문지식'] as const
type TraitKey = (typeof TRAIT_KEYS)[number]

type JobHistoryEntry = {
  roleId?: string
  levelIndex?: number
  levelLabel?: string
  analyzedAt?: string
  result?: any
  studentEmail?: string
  studentName?: string
  institutionCode?: string
  runId?: string
}

function getHistoryAvg(entry: JobHistoryEntry): number | null {
  const r = entry.result
  if (!r || typeof r !== 'object') return null
  const nums = TRAIT_KEYS.map((k) => {
    const block = (r as any)[k]
    const score = block?.score ?? block?.점수
    return typeof score === 'number' ? score : null
  }).filter((x): x is number => typeof x === 'number')
  if (!nums.length) return null
  return Math.round(nums.reduce((s, n) => s + n, 0) / nums.length)
}

export default function MyPage() {
  const [guest, setGuest] = useState(true)
  const [error, setError] = useState('')

  const [user, setUser] = useState<any>(null)
  const [interests, setInterests] = useState<InterestOption[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle')

  const [histories, setHistories] = useState<JobHistoryEntry[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1) Supabase 우선 로딩 (멀티디바이스 대응)
    if (supabase) {
      ;(async () => {
        const userId = await getSupabaseUserId()
        if (!userId) return
        const { data } = await supabase.auth.getSession()
        const email = data?.session?.user?.email || ''
        const prof = await getProfileByUserId(userId)
        if (!prof) return

        setUser({
          id: prof.id,
          email,
          name: prof.name,
          school: prof.school,
          major: prof.major,
          status: prof.status,
          interests: prof.interests,
          institutionCode: prof.institution_code,
        })
        setInterests((prof.interests || []) as InterestOption[])

        const rows = await fetchStepResultsForUser({ userId })
        setHistories(rows as any)
        setGuest(false)
      })().catch(() => {
        // ignore -> localStorage fallback
      })
      // Supabase가 켜져 있더라도, 실패 시 아래 localStorage fallback으로 동작
    }

    const raw = window.localStorage.getItem(AUTH_KEY)
    if (!raw) {
      if (!supabase) setGuest(true)
      return
    }

    try {
      const parsed = JSON.parse(raw)
      const currentUser = parsed?.currentUser
      const users = parsed?.users || []
      if (!currentUser?.email) {
        if (!supabase) setGuest(true)
        return
      }

      const fullUser = users.find((u: any) => u.email === currentUser.email) || currentUser
      setUser(fullUser)
      setInterests((fullUser?.interests || []) as InterestOption[])

      const historyRaw = window.localStorage.getItem(HISTORY_KEY)
      const parsedHistory: JobHistoryEntry[] = historyRaw ? JSON.parse(historyRaw) : []
      const myEmail = currentUser.email
      setHistories(parsedHistory.filter((h) => (h.studentEmail || '') === myEmail))
      setGuest(false)
    } catch {
      setGuest(true)
      setError('로컬 데이터 로딩에 실패했습니다.')
    }
  }, [])

  const institutionText = useMemo(() => {
    if (!user) return ''
    const instCode = user.institutionCode ? ` · 기관코드 ${user.institutionCode}` : ''
    const school = user.school ? `소속: ${user.school}` : '소속: 미입력'
    return `${school}${instCode}`
  }, [user])

  const toggleInterest = (opt: InterestOption) => {
    setSaveStatus('idle')
    setInterests((prev) => (prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]))
  }

  const canSave = interests.length > 0

  const handleSaveInterests = () => {
    if (typeof window === 'undefined') return
    if (!user?.email) return
    if (!canSave) {
      setError('관심 분야를 최소 1개 이상 선택해 주세요.')
      return
    }

    setError('')

    // Supabase 저장 (안전장치: 실패해도 localStorage 저장은 그대로 수행)
    const saveToSupabase = async () => {
      if (!supabase) return
      try {
        const userId = await getSupabaseUserId()
        if (!userId) return
        await updateStudentInterests({ userId, interests })
      } catch {
        // ignore
      }
    }

    void saveToSupabase().finally(() => {
      // 기존 localStorage 저장 (기존 UI 호환)
      const raw = window.localStorage.getItem(AUTH_KEY)
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        const users = parsed?.users || []
        const nextUsers = users.map((u: any) => {
          if (u.email !== user.email) return u
          return { ...u, interests }
        })

        const next = { ...parsed, users: nextUsers, currentUser: parsed.currentUser }
        window.localStorage.setItem(AUTH_KEY, JSON.stringify(next))
        notifyAuthStorageUpdated()
        requestNavAuthRefresh()
        setSaveStatus('saved')
      } catch {
        setError('저장에 실패했습니다.')
      }
    })
  }

  if (guest) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-xl font-bold text-slate-900 mb-2">내 정보</h1>
          <p className="text-sm text-slate-600 mb-6">
            회원가입/로그인 후 이용 가능합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              회원가입
            </Link>
          </div>
          {error && <p className="text-xs text-rose-600 mt-3">{error}</p>}
        </div>
      </div>
    )
  }

  const sortedHistories = [...histories].sort((a, b) => (b.analyzedAt || '').localeCompare(a.analyzedAt || ''))
  const recentHistories = sortedHistories.slice(0, 12)

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-[0.18em] mb-2">My Page</p>
              <h1 className="text-2xl font-bold text-slate-900">내 정보</h1>
              <p className="text-sm text-slate-600 mt-2">
                아이디(이메일): <span className="font-semibold text-slate-800">{user?.email}</span>
              </p>
              <p className="text-sm text-slate-600 mt-1">{institutionText}</p>
            </div>
            <div className="text-sm text-slate-600">
              <p className="font-semibold text-slate-800">{user?.name || '—'}</p>
              <p className="mt-1">
                전공: <span className="font-semibold text-slate-800">{user?.major || '미입력'}</span>
              </p>
              <p className="mt-1">
                상태: <span className="font-semibold text-slate-800">{user?.status || '미입력'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-2">관심 분야 변경</h2>
            <p className="text-sm text-slate-600 mb-5">
              선택한 관심 분야는 시뮬레이션 추천에 반영됩니다.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {INTEREST_OPTIONS.map((opt) => {
                const active = interests.includes(opt)
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleInterest(opt)}
                    className={`px-3 py-2 rounded-xl border text-left text-sm transition-all ${
                      active
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>

            {error && <p className="text-xs text-rose-600 mt-3">{error}</p>}
            {saveStatus === 'saved' && <p className="text-xs text-emerald-700 mt-3">관심 분야가 저장되었습니다.</p>}

            <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-end">
              <button
                type="button"
                disabled={!canSave}
                onClick={handleSaveInterests}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                확인/저장
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-2">시뮬레이션 조회</h2>
            <p className="text-sm text-slate-600 mb-5">최근 실행한 시뮬레이션 기록을 확인할 수 있습니다.</p>

            {recentHistories.length === 0 ? (
              <p className="text-sm text-slate-600">아직 실행한 기록이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {recentHistories.map((h, idx) => {
                  const avgScore = getHistoryAvg(h)
                  return (
                    <div
                      key={`${h.runId || 'run'}-${h.analyzedAt || idx}`}
                      className="rounded-xl border border-slate-200 bg-slate-50/40 px-4 py-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {h.roleId || '직무'} · Level {h.levelIndex ?? '—'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 truncate">{h.levelLabel || '과제명 없음'}</p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {h.analyzedAt ? new Date(h.analyzedAt).toLocaleString() : ''}
                          </p>
                        </div>
                        <div className="text-sm font-extrabold text-indigo-700 tabular-nums">
                          {typeof avgScore === 'number' ? `${avgScore}점` : '—'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <Link
                href="/simulation"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition-colors"
              >
                시뮬레이션 다시 하기
              </Link>
            </div>
          </div>

        {/* 학생용 모듈入口 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-2">학습/상담 모듈</h2>
          <p className="text-sm text-slate-600 mb-5">기관 대시보드에서 활동이 집계됩니다.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/career-test"
              className="text-left bg-slate-50 hover:bg-white transition-colors border border-slate-200 rounded-2xl p-4"
            >
              <div className="text-sm font-semibold text-slate-900">AI 진로검사</div>
              <div className="text-xs text-slate-500 mt-1">검사 진행/리포트 다운로드</div>
            </Link>

            <Link
              href="/mentor"
              className="text-left bg-slate-50 hover:bg-white transition-colors border border-slate-200 rounded-2xl p-4"
            >
              <div className="text-sm font-semibold text-slate-900">멘토 질문</div>
              <div className="text-xs text-slate-500 mt-1">질문/답변 여부 집계</div>
            </Link>

            <Link
              href="/pick"
              className="text-left bg-slate-50 hover:bg-white transition-colors border border-slate-200 rounded-2xl p-4"
            >
              <div className="text-sm font-semibold text-slate-900">Pick 열람</div>
              <div className="text-xs text-slate-500 mt-1">열람 기록</div>
            </Link>

            <Link
              href="/vod"
              className="text-left bg-slate-50 hover:bg-white transition-colors border border-slate-200 rounded-2xl p-4"
            >
              <div className="text-sm font-semibold text-slate-900">VOD</div>
              <div className="text-xs text-slate-500 mt-1">시청 시간 기록</div>
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

