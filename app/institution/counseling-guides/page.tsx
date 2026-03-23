'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, ClipboardList, MessageSquareText, Shuffle, ArrowRight } from 'lucide-react'
import { supabase } from '../../../src/lib/supabaseClient'
import { getInstitutionByAdmin, getSupabaseUserId } from '../../../src/lib/supabaseDb'

const AUTH_KEY = 'job_sim_auth'

type InstitutionState = {
  institutionName?: string
  institutionCode?: string
  adminEmail?: string
}

export default function CounselingGuidesPage() {
  const router = useRouter()
  const [institution, setInstitution] = useState<InstitutionState | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const run = async () => {
      try {
        // 1) localStorage 기반 빠른 로딩
        const raw = window.localStorage.getItem(AUTH_KEY)
        const parsed = raw ? JSON.parse(raw) : null
        const inst = parsed?.currentInstitution
        const institutionName = inst?.institutionName ?? inst?.institution_name
        const institutionCode = inst?.institutionCode ?? inst?.institution_code
        const adminEmail = inst?.adminEmail ?? inst?.admin_email

        if (institutionName || institutionCode) {
          setInstitution({
            institutionName: institutionName || '기관',
            institutionCode: institutionCode || '',
            adminEmail: adminEmail || '',
          })
        }

        // 2) supabase 우선으로 소속명 보정(가능할 때만)
        if (supabase) {
          const userId = await getSupabaseUserId()
          if (userId) {
            const instRow = await getInstitutionByAdmin(userId)
            if (instRow) {
              setInstitution({
                institutionName: instRow.institution_name,
                institutionCode: instRow.institution_code,
                adminEmail: '',
              })
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setChecked(true)
      }
    }

    void run()
  }, [])

  if (!checked) return null

  if (!institution?.institutionCode && !institution?.institutionName) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-xl font-bold text-slate-900 mb-2">기관용 로그인이 필요합니다</h1>
          <p className="text-sm text-slate-600 mb-6">
            상담 가이드를 보려면 먼저 기관 담당자 계정으로 로그인해 주세요.
          </p>
          <button
            type="button"
            onClick={() => router.push('/institution-login')}
            className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
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
            <h1 className="text-2xl font-bold text-slate-900">상담 가이드</h1>
            <p className="text-sm text-slate-600 mt-2">
              관리자 전용 페이지에서 학생별 직무체험·AI 진단 리포트 결과를 기반으로 상담과 후속 연계를 운영하세요.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/institution/dashboard"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              대시보드로 돌아가기
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">1단계: 직무 체험(리허설) 결과 확인</h2>
                <p className="text-xs text-slate-500 mt-1">학생이 선택/수행한 직무 체험 이력을 먼저 점검합니다.</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <Shuffle className="w-4 h-4 text-indigo-600 mt-0.5" />
                <span>선택 직무와 과제 수행 흐름을 확인합니다.</span>
              </div>
              <div className="flex items-start gap-2">
                <Shuffle className="w-4 h-4 text-indigo-600 mt-0.5" />
                <span>반복 제출 여부와 준비도의 변화를 비교합니다.</span>
              </div>
              <div className="flex items-start gap-2">
                <Shuffle className="w-4 h-4 text-indigo-600 mt-0.5" />
                <span>학생이 기록한 답변/리포트를 통해 핵심 맥락을 파악합니다.</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">2단계: AI 진단 리포트 해석</h2>
                <p className="text-xs text-slate-500 mt-1">준비 수준, 강점, 부족 역량을 빠르게 도출합니다.</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-600 mt-0.5" />
                <span>직무별 점수(문제해결력/커뮤니케이션/직무이해력/완수율/전문지식)를 확인합니다.</span>
              </div>
              <div className="flex items-start gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-600 mt-0.5" />
                <span>강점은 유지하고, 부족 역량은 “다음 행동(경험/학습)”으로 연결합니다.</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <MessageSquareText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">3단계: 상담 우선순위 선정</h2>
                <p className="text-xs text-slate-500 mt-1">“가장 부족한 역량”부터 상담을 시작합니다.</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold mt-0.5">
                  1
                </span>
                <span>부족 역량이 낮은 항목을 먼저 목표로 설정합니다.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold mt-0.5">
                  2
                </span>
                <span>상담 질문은 “왜 그런 결과가 나왔는지”와 “다음 행동이 무엇인지”에 초점을 맞춥니다.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold mt-0.5">
                  3
                </span>
                <span>상담 결과를 후속 체험/학습과 연결해 반복 피드백이 되도록 운영합니다.</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <Shuffle className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">4단계: 후속 연계 운영</h2>
                <p className="text-xs text-slate-500 mt-1">학생 준비 방향에 맞춰 프로그램을 연결합니다.</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold mt-0.5">
                  1
                </span>
                <span>학생이 필요로 하는 “다음 경험/학습”을 정리합니다.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold mt-0.5">
                  2
                </span>
                <span>기관이 제공하는 프로그램/리소스와 연결해 실행 우선순위를 세웁니다.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold mt-0.5">
                  3
                </span>
                <span>이후 다음 직무 체험 결과로 피드백을 반복합니다.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">상담 운영 템플릿(예시)</h2>
              <p className="text-xs text-slate-500 mt-1">
                아래 질문 프레임으로 학생의 “준비 이유-근거-다음 행동”을 빠르게 정리해 보세요.
              </p>
            </div>
            <Link
              href="/institution/students"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors whitespace-nowrap"
            >
              학생 상태 보러가기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-900 mb-1">Q1. 어떤 지점에서 가장 어려웠나요?</p>
              <p className="text-xs text-slate-600">결과를 낳은 “근거(경험/정보/가정)”를 짚습니다.</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-900 mb-1">Q2. 다음 번에는 무엇을 바꾸면 될까요?</p>
              <p className="text-xs text-slate-600">부족 역량을 “다음 행동(경험/학습)”으로 전환합니다.</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-900 mb-1">Q3. 기관이 제공하는 리소스와 연결하려면?</p>
              <p className="text-xs text-slate-600">후속 연계(프로그램/자료/멘토링) 우선순위를 정합니다.</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-900 mb-1">Q4. 다음 결과를 어떻게 측정할까요?</p>
              <p className="text-xs text-slate-600">AI 진단 리포트 점수 변화로 확인합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

