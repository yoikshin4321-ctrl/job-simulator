import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Sparkles, ChevronRight, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'

const STORAGE_KEY = 'job_sim_temp_answer'

function getStoredState(roleId) {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (!s) return null
    const d = JSON.parse(s)
    return d?.roleId === roleId ? d : null
  } catch { return null }
}

const LOADING_MESSAGES = [
  'AI가 제출하신 답안을 분석하고 있습니다...',
  '현직자 데이터와 매칭 중...',
  '역량 리포트를 생성하고 있습니다...',
]

const SIMULATION_LEVELS = {
  pm: {
    tag: 'PM (Product Manager)',
    levels: [
      {
        title: 'Level 1 · 자주 묻는 질문 정리',
        background: '고객센터 문의 분석 결과, "배송", "반품", "결제" 관련 문의가 상위를 차지합니다. 개발 리소스는 아직 투입 전입니다.',
        task: '고객 문의 중 자주 묻는 질문(FAQ) 유형을 3가지 정리하고, 각 유형에 대한 대응 방안을 1문단씩 제안해 주세요.',
        feedback: '질문 유형을 비즈니스 관점으로 잘 분류했습니다. 다음 단계에서는 구체적인 우선순위 근거(빈도, 고객 임팩트, 해결 난이도)를 수치적으로 비교해 보세요.',
        proTip: '우선순위를 정할 땐 "고객 가치"와 "개발 공수" 두 축으로 2x2 매트릭스를 그려보면 설득력이 높아집니다.',
      },
      {
        title: 'Level 2 · 채팅 기능 도입 우선순위',
        background: 'FAQ 분석을 바탕으로 채팅봇 도입이 검토됩니다. 예산과 인력이 제한되어 한 번에 하나의 기능만 우선 도입할 수 있습니다.',
        task: '채팅봇 우선 도입 대상을 1개 선정하고, 선택 이유와 기대 효과를 데이터·비즈니스 관점에서 정당화해 주세요.',
        feedback: '선택 근거를 논리적으로 제시했습니다. MVP 백로그 작성 시에는 각 항목별 예상 공수(스토리 포인트 또는 인일)와 스프린트 구간을 추가하면 실행 가능성이 높아집니다.',
        proTip: '백로그 항목은 "사용자 스토리 + 수용 기준 + 예상 효과" 형태로 정리하면 개발팀과 소통이 원활합니다.',
      },
      {
        title: 'Level 3 · MVP 백로그 작성',
        background: '다음 분기에 개발 인력이 투입됩니다. 여러 스테이크홀더의 요청이 쌓여 있으며, 데이터와 비즈니스 임팩트를 근거로 우선순위를 결정해야 합니다.',
        task: 'MVP 백로그 5~7개 항목을 작성해 주세요. 각 항목에 우선순위 근거, 예상 효과, 그리고 필요 시 예상 공수를 반드시 포함해 주세요.',
        feedback: '현직자들이 중요하게 보는 "수치적 비교"가 잘 반영되었습니다. 이 역량을 기반으로 시니어 PM으로 성장할 수 있어요.',
        proTip: '작은 프로젝트라도 처음부터 끝까지 기획하고 런칭해본 경험이 가장 큰 자산이 됩니다. 포트폴리오로 녹여보세요.',
      },
    ],
  },
  data: {
    tag: '데이터 애널리스트 (Data Analyst)',
    levels: [
      {
        title: 'Level 1 · 가설 수립',
        background: '커머스 서비스의 주간 결제 완료율이 전주 대비 약 10% 하락했습니다. 경영진이 원인 파악을 요청했습니다.',
        task: '결제 완료율 하락 원인에 대한 가설을 2개 수립해 주세요. 각 가설이 어떤 데이터로 검증 가능한지 간단히 적어 주세요.',
        feedback: '가설이 측정 가능하고 검증 가능한 형태로 잘 작성되었습니다. 다음 단계에서는 비즈니스 임팩트(매출·전환 영향도)를 정량적으로 추정해 보세요.',
        proTip: '가설은 "if-then" 형식으로 작성하면 A/B 테스트 설계에 바로 연결됩니다.',
      },
      {
        title: 'Level 2 · 비즈니스 임팩트 및 검증',
        background: '가설 검증을 위한 데이터 수집이 가능한 상태입니다. 경영진은 "얼마나 중요한 문제인가"에 대한 답을 원합니다.',
        task: '각 가설의 비즈니스 임팩트(매출·전환 영향도)를 설명하고, 가설 검증을 위한 A/B 테스트 설계안을 제안해 주세요.',
        feedback: '비즈니스 관점의 접근이 우수합니다. 경영진 대시보드에는 "결정에 필요한 1~2개 핵심 지표"에 집중하는 것이 효과적입니다.',
        proTip: '숫자를 비즈니스 언어로 번역할 때는 "So What?"을 반복해 물어보세요. 인사이트가 명확해집니다.',
      },
      {
        title: 'Level 3 · 대시보드 기획',
        background: '가설 검증 결과가 나왔고, 경영진은 지속적인 모니터링을 위한 대시보드를 요청했습니다.',
        task: '경영진용 핵심 지표 대시보드에 포함할 KPI 5개 이상과 데이터 소스를 제안해 주세요. 각 KPI의 정의와 목적을 명시해 주세요.',
        feedback: '데이터 애널리스트로서 "숫자 뒤의 행동"을 증명하는 역량이 잘 드러났습니다. 실제 비즈니스 데이터 포트폴리오를 만들어 보세요.',
        proTip: '실제 비즈니스 데이터로 가설을 세우고 분석해본 경험이 면접에서 강력한 무기가 됩니다.',
      },
    ],
  },
  marketing: {
    tag: '마케터 (Marketer)',
    levels: [
      {
        title: 'Level 1 · 페르소나 정의',
        background: '20대 대학생을 타겟으로 무선 이어폰 신제품이 다음 달 런칭됩니다. 제한된 예산으로 타겟팅이 중요합니다.',
        task: '20대 대학생 타겟 페르소나를 1명 정의해 주세요. 인구통계적 특성, 니즈, 구매 저해 요인을 포함해 주세요.',
        feedback: '페르소나가 구체적이라 메시징 방향이 명확합니다. 다음 단계에서는 이 페르소나에 맞는 카피 톤과 채널 특성을 연결해 보세요.',
        proTip: '페르소나의 "하루 일과"를 그려보면 메시지가 들어갈 순간(시점·장소)을 찾기 쉽습니다.',
      },
      {
        title: 'Level 2 · 채널별 카피 기획',
        background: '인스타그램·유튜브·검색광고 채널을 활용할 예정입니다. 채널별 특성에 맞는 메시지가 필요합니다.',
        task: '위 페르소나에 맞는 인스타그램, 유튜브, 검색광고 각 채널별 광고 카피 1안씩 기획해 주세요. 채널 특성을 반영한 차별화된 메시지를 제안해 주세요.',
        feedback: '채널별 톤앤매너 차별화가 잘 되었습니다. 마지막 단계에서는 각 카피의 성과를 어떻게 측정할지 지표를 포함해 주세요.',
        proTip: '카피는 "문제 인식 → 해결 제안 → 행동 유도(CTA)" 구조가 전환율에 유리합니다.',
      },
      {
        title: 'Level 3 · 성과 측정 포함 캠페인',
        background: '캠페인 기획이 확정되었고, 성과 측정 방안이 최종 검토 중입니다. 예산 대비 효율을 증명해야 합니다.',
        task: '채널별 광고 카피 2~3안과 함께, 각 채널에서 측정할 성과 지표(CPA, ROAS, CTR 등)를 제시하고, 캠페인 성공 기준을 정의해 주세요.',
        feedback: '데이터 기반 퍼포먼스 마케터로서의 역량이 잘 드러났습니다. 직접 광고비를 써서 캠페인을 운영해본 경험이 면접에서 강력합니다.',
        proTip: '직접 광고비를 써서 캠페인을 운영해보고 리포트를 작성해보세요. ROI를 숫자로 말할 수 있게 됩니다.',
      },
    ],
  },
}

export default function SimulationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const roleData = SIMULATION_LEVELS[id]

  const [currentLevel, setCurrentLevel] = useState(() => {
    const s = getStoredState(id)
    return s?.currentLevel ?? 1
  })
  const [answer, setAnswer] = useState(() => {
    const s = getStoredState(id)
    return s?.answer ?? ''
  })
  const [loading, setLoading] = useState(false)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackHistory, setFeedbackHistory] = useState([])
  const [showPreviousFeedback, setShowPreviousFeedback] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState(null)

  const levelData = roleData?.levels[currentLevel - 1]
  const totalLevels = 3

  // 역할(id) 변경 시 저장된 상태 동기화
  useEffect(() => {
    const s = getStoredState(id)
    if (s) {
      setCurrentLevel(s.currentLevel ?? 1)
      setAnswer(s.answer ?? '')
    } else {
      setCurrentLevel(1)
      setAnswer('')
    }
  }, [id])

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 1000)
    return () => clearInterval(interval)
  }, [loading])

  // localStorage 실시간 저장
  useEffect(() => {
    if (!id || showFeedback) return
    const payload = { roleId: id, currentLevel, answer }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      setLastSavedAt(new Date())
    } catch (e) { /* ignore */ }
  }, [id, currentLevel, answer, showFeedback])

  // 브라우저 이탈 방지
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (answer.trim().length > 0 && !showFeedback) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [answer, showFeedback])

  const handleSubmit = () => {
    setLoadingMessageIndex(0)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setFeedbackHistory((prev) => [
        ...prev,
        {
          level: currentLevel,
          feedback: levelData.feedback,
          proTip: levelData.proTip,
          title: levelData.title,
        },
      ])
      setShowFeedback(true)
    }, 3000)
  }

  const handleNextLevel = () => {
    setAnswer('')
    setShowFeedback(false)
    if (currentLevel >= totalLevels) {
      localStorage.removeItem(STORAGE_KEY)
      navigate(`/report?role=${id}`)
    } else {
      setCurrentLevel((prev) => prev + 1)
    }
  }

  if (!roleData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] w-full">
        <div className="max-w-4xl mx-auto w-full py-12 px-4 sm:px-6">
          <div className="text-center">
            <p className="text-slate-600">해당 시뮬레이션을 찾을 수 없습니다.</p>
            <Link to="/" className="mt-4 inline-block text-indigo-600 font-semibold hover:underline">
              메인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] w-full relative">
      {/* 로딩 오버레이 */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 mx-4 max-w-md w-full flex flex-col items-center text-center">
            <div className="relative w-16 h-16 mb-6">
              <span className="absolute inset-0 w-16 h-16 border-4 border-indigo-200 rounded-full" />
              <span className="absolute inset-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-slate-600 text-sm font-medium">
              {LOADING_MESSAGES[loadingMessageIndex]}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full py-8 sm:py-12 px-4 sm:px-6">
        <Link
          to="/simulation"
          className="inline-flex items-center text-slate-500 hover:text-indigo-600 text-sm font-medium mb-6"
        >
          ← 시뮬레이션 목록
        </Link>

        {/* 스테퍼 / 진행 바 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              {roleData.tag}
            </span>
            <span className="text-xs text-slate-500">
              Level {currentLevel} / {totalLevels}
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${(currentLevel / totalLevels) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {[1, 2, 3].map((step) => (
              <span
                key={step}
                className={`text-xs font-medium ${
                  step <= currentLevel ? 'text-indigo-600' : 'text-slate-400'
                }`}
              >
                Lv.{step}
              </span>
            ))}
          </div>
        </div>

        {/* 이전 피드백 보기 버튼 */}
        {feedbackHistory.length > 0 && !showFeedback && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowPreviousFeedback(!showPreviousFeedback)}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
            >
              {showPreviousFeedback ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  이전 피드백 접기
                </>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4" />
                  이전 피드백 보기 ({feedbackHistory.length}개)
                </>
              )}
            </button>
            {showPreviousFeedback && (
              <div className="mt-2 space-y-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                {feedbackHistory.map((item, i) => (
                  <div key={i} className="border-l-2 border-indigo-200 pl-3">
                    <p className="text-xs font-semibold text-indigo-600 mb-1">{item.title}</p>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.feedback}</p>
                    <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 flex-shrink-0" />
                      {item.proTip}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showFeedback ? (
          /* 피드백 영역 */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-indigo-50/50 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-bold text-[#1E293B]">AI 분석 결과 · Level {currentLevel}</span>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#1E293B] mb-2">AI 분석 결과</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{levelData.feedback}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-bold text-amber-800">현직자의 팁</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{levelData.proTip}</p>
              </div>
              <button
                type="button"
                onClick={handleNextLevel}
                className="w-full py-3.5 px-4 rounded-2xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                {currentLevel >= totalLevels ? (
                  <>역량 리포트 확인하기</>
                ) : (
                  <>
                    다음 단계 도전하기
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* 문제 영역 */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <h1 className="text-xl font-bold text-[#1E293B] mb-4">{levelData.title}</h1>
              <div className="mb-6">
                <h2 className="text-sm font-bold text-[#1E293B] mb-2">배경 설명</h2>
                <p className="text-slate-600 text-sm leading-relaxed">{levelData.background}</p>
              </div>
              <div className="mb-6">
                <h2 className="text-sm font-bold text-[#1E293B] mb-2">수행해야 할 과제</h2>
                <p className="text-slate-600 text-sm leading-relaxed">{levelData.task}</p>
              </div>
              <label htmlFor="answer" className="block text-sm font-bold text-[#1E293B] mb-2">
                답안 작성
              </label>
              <textarea
                id="answer"
                className="w-full min-h-[200px] p-4 text-[#1E293B] bg-[#F8FAFC] border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y text-sm leading-relaxed"
                placeholder="과제에 대한 답안을 자유롭게 작성해 주세요."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              {answer.trim().length > 0 && (
                <p className="mt-2 text-[10px] text-slate-400">
                  작성 중인 내용이 자동으로 저장되었습니다.{' '}
                  {lastSavedAt && (
                    <span>({lastSavedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })})</span>
                  )}
                </p>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`mt-4 w-full py-3.5 px-4 rounded-2xl font-semibold text-white text-sm transition-colors ${
                  loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                제출하고 AI 피드백 받기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
