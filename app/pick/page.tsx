'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { trackFeatureActivityEvent } from '../../src/lib/featureActivity'
import { getStudentContext } from '../../src/lib/studentContext'

type PickItem = { id: string; title: string; description: string; tag: string }

const PICK_ITEMS: PickItem[] = [
  { id: 'pick-pm-1', title: 'PM: 데이터로 문제정의하기', description: '기존 데이터를 기반으로 문제를 재정의하고, 가설-지표를 연결합니다.', tag: 'PM' },
  { id: 'pick-da-1', title: 'DA: 해석-의사결정 루프', description: '결과를 해석하고 다음 액션을 수치로 설계합니다.', tag: '데이터 분석' },
  { id: 'pick-mk-1', title: '마케팅: 메시지 실험 설계', description: '타겟과 가치제안을 정하고, 실험 플랜을 만듭니다.', tag: '마케팅' },
  { id: 'pick-dsn-1', title: '디자인: 사용자 행동 관찰', description: '사용자 여정과 개선 포인트를 도출합니다.', tag: '디자인' },
]

export default function PickPage() {
  const [student, setStudent] = useState<Awaited<ReturnType<typeof getStudentContext>>>(null)
  const [selected, setSelected] = useState<PickItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      const ctx = await getStudentContext()
      setStudent(ctx)
    })()
  }, [])

  const filtered = useMemo(() => PICK_ITEMS, [])

  const canPick = !!student?.email && !!student?.institutionCode

  const handleView = async (item: PickItem) => {
    setError('')
    if (!student) return
    if (!student.institutionCode) {
      setError('기관 코드가 설정되지 않았습니다. 먼저 `내 정보`에서 기관코드를 확인해 주세요.')
      return
    }
    setLoading(true)
    try {
      setSelected(item)
      await trackFeatureActivityEvent({
        userId: student.userId,
        institutionCode: student.institutionCode,
        studentEmail: student.email,
        studentName: student.name,
        eventType: 'pick_viewed',
        meta: {
          pickId: item.id,
          pickTitle: item.title,
          tag: item.tag,
        },
      })
    } catch {
      setError('열람 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (!student) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Pick 열람</h1>
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
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Pick 열람</h1>
              <p className="text-sm text-slate-600">기관이 제공하는 추천 자료를 확인하세요.</p>
            </div>
            <div className="text-xs text-slate-500">
              기관 코드: <span className="font-semibold">{student.institutionCode || '미설정'}</span>
            </div>
          </div>

          {(!canPick || error) && (
            <p className={`text-xs ${!canPick ? 'text-rose-600' : 'text-rose-600'} mt-1`}>
              {error || (!student.institutionCode ? '기관 코드가 설정되어야 집계됩니다.' : '')}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => void handleView(item)}
                disabled={loading}
                className="text-left bg-slate-50 hover:bg-white transition-colors border border-slate-200 rounded-2xl p-5 hover:border-indigo-200"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold">
                    {item.tag}
                  </span>
                  <span className="text-[11px] text-slate-500">{loading ? '...' : '열람'}</span>
                </div>
                <div className="mt-3">
                  <div className="text-base font-bold text-slate-900">{item.title}</div>
                  <div className="text-sm text-slate-600 mt-1">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selected && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-2">{selected.title}</h2>
            <p className="text-sm text-slate-600 mb-4">{selected.description}</p>
            <Link
              href="/simulation"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              추천 시뮬레이션으로 이동
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

