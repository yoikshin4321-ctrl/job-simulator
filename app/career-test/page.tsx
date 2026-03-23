'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { trackFeatureActivityEvent } from '../../src/lib/featureActivity'
import { getStudentContext } from '../../src/lib/studentContext'

export default function CareerTestPage() {
  const [student, setStudent] = useState<Awaited<ReturnType<typeof getStudentContext>>>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | { summary: string; recommended: string[] }>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      const ctx = await getStudentContext()
      setStudent(ctx)
    })()
  }, [])

  const recommended = useMemo(() => {
    const keywords = [
      { key: '데이터', items: ['데이터 분석가', 'BI 리포팅 담당자'] },
      { key: '마케팅', items: ['퍼포먼스 마케터', '콘텐츠 마케터'] },
      { key: '기획', items: ['PM', '제품 기획자'] },
    ]
    const joined = input.trim()
    if (!joined) return []
    const hit = keywords.find((k) => joined.includes(k.key))
    if (hit) return hit.items
    return ['PM', '데이터 분석', '마케팅']
  }, [input])

  const canSubmit = !!student?.email && input.trim().length >= 10 && !!student?.institutionCode

  const handleRun = async () => {
    setError('')
    if (!student) return
    if (!student.institutionCode) {
      setError('기관 코드가 설정되지 않았습니다. 먼저 `내 정보`에서 기관코드를 확인해 주세요.')
      return
    }
    if (input.trim().length < 10) {
      setError('질문/상황을 조금 더 구체적으로 입력해 주세요. (최소 10자)')
      return
    }
    setLoading(true)
    try {
      const len = input.trim().length
      const score = Math.min(100, Math.max(1, Math.round((len / 600) * 90 + 10)))
      const res = {
        summary: `입력 내용을 바탕으로 준비도 점수(대략): ${score}/100`,
        recommended,
      }
      setResult(res)

      await trackFeatureActivityEvent({
        userId: student.userId,
        institutionCode: student.institutionCode,
        studentEmail: student.email,
        studentName: student.name,
        eventType: 'career_test_completed',
        meta: {
          inputPreview: input.slice(0, 200),
          score,
          recommended,
        },
      })
    } catch {
      setError('검사 실행에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!result || !student) return
    const content = {
      module: 'career-test',
      generatedAt: new Date().toISOString(),
      studentEmail: student.email,
      institutionCode: student.institutionCode,
      result,
    }
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `career-test-report-${student.email}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!student) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-xl font-bold text-slate-900 mb-2">AI 진로검사</h1>
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
      <div className="max-w-3xl mx-auto w-full space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">AI 진로검사</h1>
          <p className="text-sm text-slate-600 mb-6">입력한 상황/질문을 바탕으로 추천과 요약 결과를 생성합니다.</p>

          <label className="block text-sm font-medium text-slate-700 mb-2">검사 입력</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[160px] px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            placeholder="예) 저는 데이터/마케팅 중 무엇이 더 맞을지 고민이에요. 제가 해왔던 경험과 앞으로의 목표는..."
          />
          {error && <p className="text-xs text-rose-600 mt-3">{error}</p>}

          <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              기관 코드: <span className="font-semibold">{student.institutionCode || '미설정'}</span>
            </div>
            <button
              type="button"
              disabled={loading || !canSubmit}
              onClick={handleRun}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '검사 실행 중...' : '검사 실행'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-2">검사 결과</h2>
            <p className="text-sm text-slate-700 mb-4">{result.summary}</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {result.recommended.map((x) => (
                <span key={x} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                  {x}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              리포트 다운로드
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

