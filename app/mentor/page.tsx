'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { trackFeatureActivityEvent } from '../../src/lib/featureActivity'
import { getStudentContext } from '../../src/lib/studentContext'

const DOMAINS = ['PM', '데이터 분석', '마케팅', '디자인'] as const
type Domain = (typeof DOMAINS)[number]

function getMockMentorAnswer(domain: Domain, question: string) {
  const q = question.trim()
  if (!q) return ''
  const base = domain === '데이터 분석' ? '데이터 관점에서' : domain === '마케팅' ? '시장/타겟 관점에서' : domain === '디자인' ? '사용자 경험 관점에서' : '제품/문제 관점에서'
  return (
    `${base} 사고 흐름을 잡아보면 좋아요.\n\n` +
    `1) 목표(무엇을 바꿀지) 한 문장으로 정리\n` +
    `2) 근거가 될 지표/데이터(가능하면 2개) 정의\n` +
    `3) 다음 1주 실행 액션을 3개로 쪼개기\n\n` +
    `질문 요약: "${q.slice(0, 80)}${q.length > 80 ? '...' : ''}"\n` +
    `이 흐름으로 답변/결정을 다시 구성해 보세요.`
  )
}

export default function MentorPage() {
  const [student, setStudent] = useState<Awaited<ReturnType<typeof getStudentContext>>>(null)
  const [domain, setDomain] = useState<Domain>('PM')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string>('')
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      const ctx = await getStudentContext()
      setStudent(ctx)
    })()
  }, [])

  const canSubmit = !!student?.email && question.trim().length >= 10 && !!student?.institutionCode

  const metaRecommended = useMemo(() => {
    if (!question.trim()) return ''
    if (question.includes('기획')) return '기획 관점에서 구조화가 필요'
    if (question.includes('지표') || question.includes('KPI')) return '지표/실험 설계가 핵심'
    if (question.includes('데이터')) return '데이터 수집/해석 루프를 먼저 잡기'
    return `${domain} 관점으로 구체화하면 좋아요`
  }, [domain, question])

  const handleSubmit = async () => {
    setError('')
    if (!student) return
    if (!student.institutionCode) {
      setError('기관 코드가 설정되지 않았습니다. 먼저 `내 정보`에서 기관코드를 확인해 주세요.')
      return
    }
    if (question.trim().length < 10) {
      setError('질문을 조금 더 구체적으로 입력해 주세요. (최소 10자)')
      return
    }
    setLoading(true)
    try {
      const a = getMockMentorAnswer(domain, question)
      setAnswer(a)

      await trackFeatureActivityEvent({
        userId: student.userId,
        institutionCode: student.institutionCode,
        studentEmail: student.email,
        studentName: student.name,
        eventType: 'mentor_question_submitted',
        meta: {
          domain,
          questionPreview: question.slice(0, 200),
          answered: true,
          answerPreview: a.slice(0, 500),
          mentorNote: metaRecommended,
        },
      })
    } catch {
      setError('질문 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (!student) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-xl font-bold text-slate-900 mb-2">멘토 질문</h1>
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
          <h1 className="text-2xl font-bold text-slate-900 mb-2">멘토 질문</h1>
          <p className="text-sm text-slate-600 mb-6">직무 관점에서 구체적인 다음 액션을 추천합니다.</p>

          <label className="block text-sm font-medium text-slate-700 mb-2">직무 선택</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {DOMAINS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDomain(d)}
                className={`px-3 py-2 rounded-xl border text-sm transition-all ${
                  d === domain ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <label className="block text-sm font-medium text-slate-700 mb-2">질문</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full min-h-[140px] px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            placeholder="예) 저는 데이터 분석을 하고 싶지만, 어떤 프로젝트/지표부터 시작해야 할지 모르겠어요..."
          />

          {error && <p className="text-xs text-rose-600 mt-3">{error}</p>}

          <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              기관 코드: <span className="font-semibold">{student.institutionCode || '미설정'}</span>
            </div>
            <button
              type="button"
              disabled={loading || !canSubmit}
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '답변 생성 중...' : '질문 보내기'}
            </button>
          </div>
        </div>

        {answer && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-3">멘토 답변</h2>
            <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{answer}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

