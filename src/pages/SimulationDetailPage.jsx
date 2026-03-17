import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// 1. 점진적 난이도의 3단계 문제 데이터
const SIMULATION_DATA = {
  pm: {
    id: 'pm',
    title: 'PM (서비스 기획)',
    slogan: '문제 정의와 팀의 우선순위 정렬',
    levels: [
      {
        label: 'Level 1 · 채팅 기능 도입 필요성 판단 (기초)',
        summary: '고객센터 채팅 기능 도입이 정말 필요한지, 어떤 데이터로 판단할지 정의해 보세요.',
        description:
          '최근 3개월간 고객센터 문의 중 채팅 관련 문의 비중이 8%에서 21%까지 증가했습니다. 앱 리뷰에는 “실시간 응답이 느리다”, “상담 연결까지 너무 오래 걸린다”는 피드백이 반복되고 있습니다.\n\nPM으로서 채팅/챗봇 기능 도입 필요성을 판단하기 위해, 현재 상황을 한 문장으로 요약하고 핵심 문제 정의를 작성해 주세요. 이어서, 이 문제가 실제로 얼마나 심각한지 검증하기 위해 살펴봐야 할 지표(예: 문의 유형별 티켓 수, 응답 시간, CSAT/NPS, 앱 리뷰 키워드 등)를 3~5개 정리해 주세요.',
      },
      {
        label: 'Level 2 · MVP 기능 정의 및 백로그 작성 (중급)',
        summary: '제한된 리소스 안에서 반드시 포함해야 할 채팅 기능의 MVP 범위를 정의해 보세요.',
        description:
          '개발 리소스는 한 분기당 2개 스쿼드, 스프린트 4회로 제한되어 있습니다. 채팅 기능에 찬성하는 팀과, 우선순위가 낮다고 보는 팀 간 의견이 갈린 상황입니다.\n\n이 상황에서 “반드시 이번 분기에 넣어야 하는 기능(Must)”과 “나중에 추가해도 되는 기능(Nice to have)”을 나누어 핵심 기능 리스트를 작성해 주세요. 각 기능에 대해 간단한 설명과 함께, 왜 Must/Nice로 분류했는지 한 줄씩 정리해 주세요.',
      },
      {
        label: 'Level 3 · 출시 후 KPI 설정 및 AB 테스트 설계 (고급)',
        summary: '채팅 기능 출시 전후로 어떤 지표를, 어떤 실험 구조로 검증할지 설계해 보세요.',
        description:
          '채팅 기능을 도입한 뒤, 실제로 고객 경험과 비즈니스 성과가 좋아졌는지 확인하기 위해서는 명확한 KPI와 실험 설계가 필요합니다.\n\n채팅 기능 도입 전후 성과를 측정하기 위한 핵심 KPI 3~5개를 정의하고, 각 지표가 어떤 행동 변화를 의미하는지 설명해 주세요. 이어서, 가장 중요한 한 가지 가설을 선정해 A/B 테스트(예: 기존 상담 플로우 vs. 채팅 우선 플로우)를 어떻게 설계할지(대상, 기간, 지표, 성공 기준)를 구체적으로 적어 주세요.',
      },
    ],
  },
  da: {
    id: 'da',
    title: 'DA (데이터 분석)',
    slogan: '데이터 기반의 비즈니스 인사이트 도출',
    levels: [
      {
        label: 'Level 1 · 결제 완료율 10% 하락 원인 가설 수립 (기초)',
        summary: '퍼널 데이터를 기반으로 결제 완료율 하락의 가능성 높은 원인들을 구조화해 보세요.',
        description:
          '최근 4주 동안 커머스 서비스의 주간 결제 완료율이 누적 10%p 이상 하락했습니다. 특히 모바일 웹 채널에서 장바구니 이후 단계에서 이탈이 두드러집니다.\n\n데이터 애널리스트로서, 이 현상을 설명할 수 있는 원인 가설을 3개 내외로 도출해 주세요. 각 가설마다 어떤 데이터(퍼널별 전환율, 채널별 전환, 장애 로그, 프로모션 이력 등)를 확인해야 하는지 함께 적어 주세요.',
      },
      {
        label: 'Level 2 · 핵심 지표 선정 및 대시보드 구조 설계 (중급)',
        summary: '경영진이 한눈에 볼 수 있는 핵심 지표와 대시보드 구성을 설계해 보세요.',
        description:
          '다양한 이해관계자가 결제 퍼널 이슈를 빠르게 파악할 수 있도록, 주간 대시보드가 필요합니다. 지표가 너무 많으면 오히려 해석이 어려워집니다.\n\n당신이 생각하는 핵심 지표 5개 내외를 선정하고, 각 지표를 어떤 차원(채널, 디바이스, 신규/기존 고객 등)으로 쪼개서 볼지 정의해 주세요. 이어서, 이 지표들을 어떤 시각화 형태와 레이아웃(상단 요약 카드, 퍼널 차트, 트렌드 그래프 등)으로 배치할지 설명해 주세요.',
      },
      {
        label: 'Level 3 · 가설 검증 분석 설계 및 액션 제안 (고급)',
        summary: '분석 결과를 바탕으로 실행 가능한 액션 플랜까지 연결해 보세요.',
        description:
          '데이터를 살펴본 결과, 특정 채널·디바이스 조합에서 이탈이 집중된다는 신호가 보입니다. 이제 이 신호가 우연이 아닌지 검증하고, 실질적인 개선 액션으로 이어지도록 설계해야 합니다.\n\n결제 완료율을 높이기 위한 가설 2~3개를 선정하고, 각 가설을 어떻게 검증할지(필요한 데이터, 분석 방법, 기간, 통계적 유의수준 등)를 설계해 주세요. 마지막으로, 분석 결과에 따라 실제로 취할 수 있는 액션 아이템을 3개 내외로 제안해 주세요.',
      },
    ],
  },
  marketer: {
    id: 'marketer',
    title: '마케터',
    slogan: '효율적인 매체 믹스와 고객 타겟팅',
    levels: [
      {
        label: 'Level 1 · 20대 대학생 타겟 캠페인 기획 및 KPI 설정 (기초)',
        summary: '핵심 타겟 페르소나와 캠페인 목표를 명확히 정의해 보세요.',
        description:
          '20대 대학생을 주요 타겟으로 한 무선 이어폰 신제품이 2개월 뒤 출시될 예정입니다. 경쟁사는 이미 유튜브·인스타그램·검색광고를 적극 활용 중이며, 우리 브랜드 인지도는 상대적으로 낮은 편입니다.\n\n마케터로서 대표 타겟 페르소나 1명을 정의하고, 이 캠페인의 1차 목표(예: 인지도, 관심, 전환)를 정리해 주세요. 이어서, 캠페인 성과를 측정하기 위한 핵심 KPI 3~5개(예: 도달수, CTR, 전환수, ROAS)를 제안해 주세요.',
      },
      {
        label: 'Level 2 · 매체 믹스 및 메시지 전략 설계 (중급)',
        summary: '인스타그램·유튜브·검색광고 각각의 역할과 메시지 전략을 설계해 보세요.',
        description:
          '캠페인 예산은 제한적이며, “브랜드 인지도 제고”와 “실질적인 구매 전환”을 동시에 달성해야 합니다. 각 매체마다 강점과 역할이 다릅니다.\n\n인스타그램, 유튜브, 검색광고에 대해 각각 어떤 역할(인지/흥미/전환)을 맡길지 정의하고, 각 매체에 어울리는 핵심 메시지와 크리에이티브 방향을 간단히 설계해 주세요. 예산 배분 비율(%)과 기대하는 결과를 함께 적어 주세요.',
      },
      {
        label: 'Level 3 · 캠페인 성과 분석 및 AB 테스트 설계 (고급)',
        summary: '캠페인 운영 중 어떤 실험을 통해 학습 효율을 높일지 설계해 보세요.',
        description:
          '첫 번째 캠페인 집행 후, 일부 매체에서는 클릭률은 높지만 전환율은 낮고, 다른 매체에서는 소수의 클릭으로도 높은 전환율을 보이는 등 결과가 혼재되어 있습니다.\n\n캠페인 성과를 개선하기 위해 반드시 진행해야 할 A/B 테스트 1~2개를 정의해 주세요. 예를 들어 “할인 혜택 강조 vs. 브랜드 스토리 강조” 메시지 비교, “크리에이티브 A vs. B” 비교 등 실험을 설계하고, 각 실험의 목표 지표, 타겟, 기간, 예산 배분 방식을 구체적으로 적어 주세요.',
      },
    ],
  },
};

export default function SimulationDetailPage() {
  const params = useParams();
  const id = (params.id || 'pm').toLowerCase();
  const roleData = SIMULATION_DATA[id] || SIMULATION_DATA.pm;

  // 2. 단계별 진행 로직 상태
  const [currentLevel, setCurrentLevel] = useState(0); // 0,1,2 => Level 1,2,3
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showNext, setShowNext] = useState(false);
  const [error, setError] = useState('');
  const [isReport, setIsReport] = useState(false);

  const levelData = roleData.levels[currentLevel];
  const isLastLevel = currentLevel === roleData.levels.length - 1;

  const handleSubmit = () => {
    if (!answer.trim()) {
      setError('답안을 먼저 입력해 주세요.');
      return;
    }

    setError('');
    setIsLoading(true);
    setFeedback('');
    setShowNext(false);

    // 100% 가상 로직: 2초 로딩 후 피드백 생성
    setTimeout(() => {
      setIsLoading(false);
      setFeedback(
        [
          '작성하신 답안에 대한 분석 결과입니다. (가상 피드백)',
          '',
          '✅ 잘한 점',
          '- 문제 상황을 자신의 언어로 정리하려는 시도가 좋습니다.',
          '- 핵심 지표와 의사결정 기준을 연결하려는 흐름이 보입니다.',
          '',
          '🔎 다음 단계에서 신경 써야 할 점',
          '- 숫자와 지표를 조금 더 구체적으로 적어보면 설득력이 높아집니다.',
          '- 실제 이해관계자(개발/디자인/마케팅 등)에게 어떻게 설명하고 설득할지까지 상상해 보세요.',
        ].join('\n')
      );
      setShowNext(true);
    }, 2000);
  };

  const handleNextLevel = () => {
    // 마지막 레벨이면 최종 리포트로 전환
    if (isLastLevel) {
      setIsReport(true);
      return;
    }

    // 다음 레벨로 이동
    setCurrentLevel((prev) => Math.min(prev + 1, roleData.levels.length - 1));
    setAnswer('');
    setFeedback('');
    setShowNext(false);
    setError('');
    setIsLoading(false);
  };

  // 3. 최종 결과 리포트용 가상 데이터
  const personalityProfiles = {
    pm: {
      title: 'PM (서비스 기획)',
      fitLabel: '매우 적합',
      summary: '사용자 문제를 정의하고 팀을 이끄는 PM 역할에 높은 잠재력을 보이고 있습니다.',
      strengths: [
        '복잡한 상황을 구조화하고 우선순위를 세우는 능력이 돋보입니다.',
        '이해관계자 간 조율과 커뮤니케이션에 강점이 있습니다.',
      ],
      improvements: [
        '정량 지표와 비즈니스 임팩트를 연결하는 연습을 더해 보세요.',
        '리스크와 제약 조건을 명시적으로 표현하는 습관을 들이면 좋습니다.',
      ],
      traits: [
        { name: '전략적 사고', score: 90 },
        { name: '데이터 해석', score: 75 },
        { name: '소통·조율', score: 88 },
        { name: '문제 해결', score: 92 },
        { name: '리더십', score: 85 },
        { name: '실행력', score: 80 },
      ],
      roadmap: [
        '서비스 기획 관련 서적과 PM 블로그를 통해 문제 정의 사례를 수집해 보세요.',
        '사이드 프로젝트나 해커톤에서 기획자 역할을 맡아 백로그를 직접 작성해 보세요.',
        '실제 기업의 채용 공고를 참고해, 자신만의 PM 포트폴리오를 정리해 보세요.',
      ],
    },
    da: {
      title: 'DA (데이터 분석)',
      fitLabel: '적합',
      summary: '데이터를 활용해 비즈니스 인사이트를 도출하는 역량이 잘 보입니다.',
      strengths: [
        '퍼널 구조와 지표 정의에 대한 이해도가 높습니다.',
        '데이터를 기반으로 가설을 세우고 검증하는 사고 흐름이 좋습니다.',
      ],
      improvements: [
        'SQL, 파이썬 등 도구 활용 능력을 더 키우면 분석 속도와 범위가 넓어집니다.',
        '분석 결과를 비즈니스 액션으로 번역하는 연습을 꾸준히 해 보세요.',
      ],
      traits: [
        { name: '전략적 사고', score: 80 },
        { name: '데이터 해석', score: 90 },
        { name: '소통·조율', score: 72 },
        { name: '문제 해결', score: 85 },
        { name: '리더십', score: 70 },
        { name: '실행력', score: 78 },
      ],
      roadmap: [
        'SQL, 파이썬, 엑셀/구글시트 등 기본 분석 도구를 체계적으로 학습해 보세요.',
        '공개 데이터셋으로 작은 분석 리포트를 만들어 포트폴리오를 쌓아 보세요.',
        '스타트업/대기업 데이터 직무 인턴십에 도전해 실무 경험을 쌓아 보세요.',
      ],
    },
    marketer: {
      title: '마케터',
      fitLabel: '매우 적합',
      summary: '타깃 정의와 메시지 설계, 매체 전략 측면에서 높은 잠재력을 보이고 있습니다.',
      strengths: [
        '타겟 페르소나를 구체적으로 상상하고 언어화하는 능력이 강점입니다.',
        '채널별 역할을 나누고 캠페인 구조를 설계하는 감각이 좋습니다.',
      ],
      improvements: [
        '퍼포먼스 지표(CTR, CPA, ROAS 등)를 수치로 다루는 연습을 더해 보세요.',
        '크리에이티브 테스트 결과를 기반으로 학습을 정리하는 습관을 들이면 좋습니다.',
      ],
      traits: [
        { name: '전략적 사고', score: 85 },
        { name: '데이터 해석', score: 70 },
        { name: '소통·조율', score: 90 },
        { name: '문제 해결', score: 82 },
        { name: '리더십', score: 78 },
        { name: '실행력', score: 88 },
      ],
      roadmap: [
        '디지털 마케팅 기본 개념과 주요 지표를 정리하며 이론을 탄탄히 다져 보세요.',
        '소규모 광고 캠페인 또는 개인 채널 운영을 통해 직접 테스트를 해 보세요.',
        '브랜드/퍼포먼스 마케팅 인턴십에 지원해 실전 경험을 쌓아 보세요.',
      ],
    },
  };

  const profile = personalityProfiles[id] || personalityProfiles.pm;

  // 레이더(육각형) 차트용 좌표 계산
  const getRadarPoints = () => {
    const centerX = 130;
    const centerY = 130;
    const maxRadius = 90;

    return profile.traits
      .map((trait, index) => {
        const angle = (Math.PI * 2 * index) / profile.traits.length - Math.PI / 2;
        const radius = (trait.score / 100) * maxRadius;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  };

  // 리포트 모드일 때: 성장 리포트 화면으로 전환
  if (isReport) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 px-6 py-6 sm:px-10 sm:py-8">
            {/* 상단 타이틀 */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-1">
                  최종 결과 리포트
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {profile.title} 시뮬레이션 완료!{' '}
                  <span className="text-indigo-600">당신의 성장 잠재력은?</span>
                </h1>
              </div>
              <Link
                to="/simulation"
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-500 hover:bg-slate-50"
              >
                다른 직무 시뮬레이션 보기
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-8">
              {/* 중앙: 육각형 레이더 차트 */}
              <div className="lg:col-span-2 flex flex-col items-center justify-center">
                <div className="w-full max-w-md mx-auto">
                  <div className="relative bg-slate-50 rounded-3xl border border-slate-100 p-6">
                    <p className="text-xs font-semibold text-slate-500 mb-3">
                      Personality Fit · 성격 적합도 레이더
                    </p>
                    <div className="relative flex items-center justify-center">
                      <svg width="260" height="260" viewBox="0 0 260 260">
                        {/* 그리드용 기본 육각형 */}
                        {[0.33, 0.66, 1].map((ratio, idx) => {
                          const r = 90 * ratio;
                          const points = profile.traits
                            .map((_, index) => {
                              const angle =
                                (Math.PI * 2 * index) / profile.traits.length - Math.PI / 2;
                              const x = 130 + r * Math.cos(angle);
                              const y = 130 + r * Math.sin(angle);
                              return `${x},${y}`;
                            })
                            .join(' ');
                          return (
                            <polygon
                              // eslint-disable-next-line react/no-array-index-key
                              key={idx}
                              points={points}
                              fill="none"
                              stroke="#E2E8F0"
                              strokeWidth="1"
                            />
                          );
                        })}

                        {/* 실제 점수 레이더 */}
                        <polygon
                          points={getRadarPoints()}
                          fill="rgba(79, 70, 229, 0.18)"
                          stroke="#4F46E5"
                          strokeWidth="2"
                        />

                        {/* 축 라인 */}
                        {profile.traits.map((_, index) => {
                          const angle =
                            (Math.PI * 2 * index) / profile.traits.length - Math.PI / 2;
                          const x = 130 + 90 * Math.cos(angle);
                          const y = 130 + 90 * Math.sin(angle);
                          return (
                            <line
                              // eslint-disable-next-line react/no-array-index-key
                              key={index}
                              x1="130"
                              y1="130"
                              x2={x}
                              y2={y}
                              stroke="#E2E8F0"
                              strokeWidth="1"
                            />
                          );
                        })}
                      </svg>

                      {/* 항목 라벨 */}
                      {profile.traits.map((trait, index) => {
                        const angle =
                          (Math.PI * 2 * index) / profile.traits.length - Math.PI / 2;
                        const r = 110;
                        const x = 130 + r * Math.cos(angle);
                        const y = 130 + r * Math.sin(angle);
                        return (
                          <div
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            className="absolute text-[10px] text-slate-600"
                            style={{
                              left: x,
                              top: y,
                              transform: 'translate(-50%, -50%)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <div>{trait.name}</div>
                            <div className="font-semibold text-indigo-600">{trait.score}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 우측: 직무 적합도 요약 */}
              <div className="flex flex-col justify-between bg-slate-50 rounded-3xl border border-slate-100 p-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">
                    직무 적합도 요약
                  </p>
                  <p className="text-sm font-semibold text-slate-900 mb-1">
                    당신은 이 직무에{' '}
                    <span className="text-indigo-600">"{profile.fitLabel}"</span>한 인재입니다.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {profile.summary}
                  </p>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 mb-1">강점 포인트</p>
                    <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                      {profile.strengths.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">보완하면 좋은 점</p>
                    <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                      {profile.improvements.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsReport(false);
                    setCurrentLevel(0);
                    setAnswer('');
                    setFeedback('');
                    setShowNext(false);
                    setError('');
                  }}
                  className="mt-6 w-full py-3 text-xs font-semibold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-100"
                >
                  다시 풀어보기
                </button>
              </div>
            </div>

            {/* 하단: 커리어 로드맵 */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">
                Career Roadmap
              </p>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 mb-4">
                {profile.title}이 되기 위해 지금부터 할 수 있는 것들
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.roadmap.map((step, index) => (
                  <div
                    key={step}
                    className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex flex-col h-full"
                  >
                    <p className="text-xs font-semibold text-indigo-600 mb-2">
                      단계 {index + 1}
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* 3. 아주 심플한 헤더 (002200 스타일) */}
        <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-indigo-600 truncate">
              {roleData.title}
            </h1>
            <span className="text-slate-300">|</span>
            <p className="text-xs sm:text-sm text-slate-600 truncate">
              {roleData.slogan}
            </p>
          </div>
          <Link
            to="/simulation"
            className="text-xs text-slate-400 hover:text-indigo-600 whitespace-nowrap"
          >
            ← 다른 직무 선택
          </Link>
        </div>

        {/* 메인 영역: 좌측 지문 / 우측 답안 작성 */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[520px]">
          {/* 좌측: 지문 영역 */}
          <div className="flex-1 px-8 py-8 space-y-4 bg-white">
            {/* 상단: 현재 레벨 / 난이도 요약 */}
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {levelData.label}
              </span>
              <span className="text-[11px] text-slate-400">
                {currentLevel + 1} / {roleData.levels.length} 단계
              </span>
            </div>

            {/* 직무명 | 레벨 제목 (간단 헤더) */}
            <p className="text-sm font-semibold text-slate-700">
              {roleData.title} | 단계별 실무 과제
            </p>

            {/* 레이블 없이 지문만 깔끔하게 노출 */}
            <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {levelData.summary}
            </p>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {levelData.description}
            </p>

            {/* AI 피드백 영역 */}
            {feedback && (
              <div className="mt-6 bg-slate-50 border border-indigo-100 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap">
                <p className="text-xs font-semibold text-indigo-600 mb-2">
                  AI 실무진 분석 피드백
                </p>
                {feedback}
              </div>
            )}
          </div>

          {/* 우측: 답안 작성 영역 */}
          <div className="w-full md:w-[360px] bg-slate-50/60 p-6 md:p-8 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col gap-4">
            <div className="flex-1 flex flex-col">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">답안 작성</h2>
              <textarea
                className="flex-1 min-h-[180px] w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white resize-none"
                placeholder="이 상황에서 당신이라면 어떻게 판단하고 행동할지, 구체적으로 작성해 보세요."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              {error && (
                <p className="mt-2 text-xs text-rose-500">
                  {error}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {/* 아직 피드백 전: 제출 버튼만 노출 */}
              {!showNext && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? 'AI가 분석 중입니다...' : '제출하기'}
                </button>
              )}

              {/* 피드백 후: 다시 도전하기 / 다음 레벨 (또는 최종 리포트) */}
              {showNext && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAnswer('');
                      setFeedback('');
                      setShowNext(false);
                      setError('');
                    }}
                    className="flex-1 py-3.5 bg-white text-sm font-semibold text-indigo-600 rounded-xl border border-indigo-600 hover:bg-indigo-50 transition-all"
                  >
                    다시 도전하기
                  </button>
                  <button
                    type="button"
                    onClick={handleNextLevel}
                    className="flex-1 py-3.5 bg-indigo-600 text-sm font-semibold text-white rounded-xl hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    {isLastLevel ? '최종 역량 리포트 확인하기' : '다음 레벨 도전하기'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}