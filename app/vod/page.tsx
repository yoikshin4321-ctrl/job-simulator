'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { trackFeatureActivityEvent } from '../../src/lib/featureActivity'
import { getStudentContext } from '../../src/lib/studentContext'

type VodItem = { id: string; title: string; durationHintSec: number; description: string }

const VODS: VodItem[] = [
  { id: 'vod-1', title: '실무형 진로 가이드: 데이터/PM 관점', durationHintSec: 260, description: '준비도를 높이는 실행 루틴을 알려드립니다.' },
  { id: 'vod-2', title: '멘토 질문 활용법: 답변에서 액션 뽑기', durationHintSec: 190, description: '질문 → 답변 → 다음 행동으로 연결하는 방식입니다.' },
  { id: 'vod-3', title: '성과 기록: 월별 리포트 작성 전략', durationHintSec: 240, description: '월별로 측정 가능한 성과를 남기는 방법입니다.' },
]

export default function VodPage() {
  const [student, setStudent] = useState<Awaited<ReturnType<typeof getStudentContext>>>(null)
  const [selected, setSelected] = useState<VodItem | null>(VODS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [watching, setWatching] = useState(false)
  const [watchedSeconds, setWatchedSeconds] = useState(0)
  const startTsRef = useRef<number | null>(null)

  useEffect(() => {
    void (async () => {
      const ctx = await getStudentContext()
      setStudent(ctx)
    })()
  }, [])

  useEffect(() => {
    if (!watching) return
    const t = window.setInterval(() => {
      if (startTsRef.current == null) return
      const s = Math.max(0, Math.round((Date.now() - startTsRef.current) / 1000))
      setWatchedSeconds(s)
    }, 1000)
    return () => window.clearInterval(t)
  }, [watching])

  const canWatch = !!student?.email && !!student?.institutionCode && !!selected

  const handleStart = () => {
    setError('')
    if (!student?.institutionCode) {
      setError('기관 코드가 설정되어야 집계됩니다.')
      return
    }
    startTsRef.current = Date.now()
    setWatchedSeconds(0)
    setWatching(true)
  }

  const handleStop = async () => {
    setError('')
    if (!student || !selected) return
    if (startTsRef.current == null) return
    const seconds = Math.max(1, Math.round((Date.now() - startTsRef.current) / 1000))
    startTsRef.current = null
    setWatching(false)

    setLoading(true)
    try {
      await trackFeatureActivityEvent({
        userId: student.userId,
        institutionCode: student.institutionCode,
        studentEmail: student.email,
        studentName: student.name,
        eventType: 'vod_watched_completed',
        durationSeconds: seconds,
        meta: {
          vodId: selected.id,
          vodTitle: selected.title,
        },
      })
    } catch {
      setError('시청 기록 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const vodList = useMemo(() => VODS, [])

  if (!student) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-xl font-bold text-slate-900 mb-2">VOD 시청</h1>
          <p className="text-sm text-slate-600 mb-6">회원가입/로그인 후 이용 가능합니다.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/login" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold text-center">
              로그인
            </Link>
            <Link href="/signup" className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-semibold text-center">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">VOD</h1>
              <p className="text-sm text-slate-600">시청 시간을 기록해 기관 대시보드에서 확인할 수 있습니다.</p>
            </div>
            <div className="text-xs text-slate-500">
              기관 코드: <span className="font-semibold">{student.institutionCode || '미설정'}</span>
            </div>
          </div>

          {error && <p className="text-xs text-rose-600 mb-3">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-2">
              {vodList.map((v) => {
                const active = selected?.id === v.id
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelected(v)}
                    className={`w-full text-left border rounded-2xl p-4 transition-all ${
                      active ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-900">{v.title}</div>
                    <div className="text-[11px] text-slate-500 mt-2">{Math.round(v.durationHintSec / 60)}분 내외</div>
                  </button>
                )
              })}
            </div>

            <div className="md:col-span-2 border border-slate-200 rounded-2xl p-5 bg-slate-50">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">{selected?.title}</div>
                  <div className="text-sm text-slate-600 mt-1">{selected?.description}</div>
                </div>
                <div className="text-xs text-slate-500 whitespace-nowrap">
                  시청: <span className="font-semibold">{watchedSeconds}s</span>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                {!watching ? (
                  <button
                    type="button"
                    disabled={!canWatch || loading}
                    onClick={handleStart}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    시청 시작(기록)
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void handleStop()}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    시청 종료 & 기록 저장
                  </button>
                )}

                <div className="text-xs text-slate-500">
                  실제 영상 플레이 대신 “시청 시간”을 기준으로 기록합니다. (데모/초기 버전)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

