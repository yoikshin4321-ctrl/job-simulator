import axios from 'axios'

// Vercel(Next) + Vite 환경 모두에서 안전하게 동작하도록 env 접근을 방어적으로 처리
// 1순위: Node/Next 서버의 process.env.VITE_OPENAI_API_KEY
// 2순위: Vite 클라이언트의 import.meta.env.VITE_OPENAI_API_KEY
// 그 외: 빈 문자열
// Next.js 클라이언트 번들: Vercel에는 NEXT_PUBLIC_* 만 노출됨 → 동일 키를 양쪽 이름으로 설정 가능
const OPENAI_API_KEY =
  (typeof process !== 'undefined' &&
    process.env &&
    (process.env.NEXT_PUBLIC_VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY)) ||
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_OPENAI_API_KEY) ||
  ''
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

/**
 * 사용자의 주관식 답변을 OpenAI gpt-4o-mini로 분석합니다.
 * - raw: 모델이 그대로 반환한 텍스트 (화면 표시용)
 * - parsed: JSON으로 파싱이 성공했을 경우의 객체 (그래프/점수 계산용, 실패하면 null)
 */
export async function analyzeAnswerWithOpenAI(answerText, roleId = 'pm') {
  console.log('VITE_OPENAI_API_KEY loaded?', !!OPENAI_API_KEY)

  if (!OPENAI_API_KEY) {
    // 개발 중에는 알림으로 바로 알 수 있게 처리
    if (typeof window !== 'undefined') {
      alert('OpenAI API 키가 설정되어 있지 않습니다. .env의 VITE_OPENAI_API_KEY 값을 확인해 주세요.')
    }
    throw new Error('OPENAI API 키가 설정되어 있지 않습니다. .env에 VITE_OPENAI_API_KEY를 확인하세요.')
  }

  let focus = ''
  if (roleId === 'da') {
    focus =
      '특히 데이터 해석 능력과 논리적 근거(가설-데이터-결론의 연결)를 가장 중요하게 평가해.'
  } else if (roleId === 'marketer') {
    focus =
      '특히 타겟팅 전략 설정과 창의적인 소구점(메시지/콘셉트 아이디어)을 가장 중요하게 평가해.'
  } else {
    // 기본: PM 관점
    focus =
      '특히 비즈니스 로직의 타당성과 유저 가치(사용자 문제를 얼마나 잘 해결하는지)를 가장 중요하게 평가해.'
  }

  const systemPrompt =
    '너는 10년 차 베테랑 직무 역량 평가관이야. ' +
    '사용자의 답변을 [문제해결력, 커뮤니케이션, 직무이해력, 완수율, 전문지식] 5개 항목으로 평가해줘. ' +
    focus +
    ' 각 항목에 대해 1~100점 사이 정수 점수와 짧은 평가 이유를 포함해 설명해 줘. ' +
    '가능하다면 JSON 형태(예: {"문제해결력": {"score": 80, "reason": "..."}, ...})로 구조화해서 답변해 주되, ' +
    '형식이 조금 어긋나도 괜찮아. 핵심은 사람이 읽을 수 있을 만큼 명확한 점수와 이유를 제공하는 거야.'

  const userPrompt = `사용자 답변:\n${answerText}`

  let response
  try {
    response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o-mini', // 저렴하고 응답이 빠른 모델
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      },
    )
  } catch (error) {
    if (error.response) {
      console.error('OpenAI 에러 상세:', error.response.data)
    } else {
      console.error('OpenAI 에러:', error.message)
    }
    throw error
  }

  const content = response?.data?.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI 응답에서 내용을 찾을 수 없습니다.')
  }

  let parsed = null
  try {
    parsed = JSON.parse(content)
  } catch (e) {
    // 모델이 불필요한 텍스트를 섞어서 보냈을 가능성에 대비해 중괄호만 추출
    const match = content.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        parsed = JSON.parse(match[0])
      } catch {
        parsed = null
      }
    }
  }

  return { raw: content, parsed }
}

function buildRoleFocus(roleId) {
  if (roleId === 'da') {
    return '특히 데이터 해석 능력과 논리적 근거(가설-데이터-결론의 연결)를 가장 중요하게 평가해.'
  }
  if (roleId === 'marketer') {
    return '특히 타겟팅 전략 설정과 창의적인 소구점(메시지/콘셉트 아이디어)을 가장 중요하게 평가해.'
  }
  // default: PM
  return '특히 비즈니스 로직의 타당성과 유저 가치(사용자 문제를 얼마나 잘 해결하는지)를 가장 중요하게 평가해.'
}

function buildRoleKoreanLabel(roleId) {
  if (roleId === 'da') return '데이터 분석가 (Data Analyst)'
  if (roleId === 'marketer') return '마케터 (Marketer)'
  return 'PM (서비스/프로덕트 기획)'
}

/**
 * 출제·채점 시 공통으로 쓰는 레벨별 난이도 기준 (1=기본, 2=중급, 3=고급)
 */
function getLevelDifficultyCriteria(levelIndex) {
  const n = levelIndex === 2 ? 2 : levelIndex === 3 ? 3 : 1
  if (n === 1) {
    return {
      label: 'Level 1 · 기본',
      forTask: [
        '한 가지 명확한 비즈니스/사용자 상황에 집중한다.',
        '요구사항은 "상황 한 문장 요약 → 핵심 문제 정의 → 바로 실행 가능한 다음 액션 1~2가지" 수준으로 제한한다.',
        '복수 이해관계자 간 큰 갈등, 분기별 로드맵, 통계적 실험 설계, 복잡한 수치 모델링은 다루지 않는다.',
        '답변 분량은 실무에서 5~10문장 안에서 끝낼 수 있는 난이도로 과제를 설계한다.',
      ],
      forGrading:
        '이번 제출은 Level 1(기본) 과제다. 핵심 상황 이해·문제 정의의 명확성·실행 가능한 다음 단계 제시를 우선 채점하고, Level 2~3에서 기대하는 실험/KPI 설계 수준까지 요구하지 마라.',
    }
  }
  if (n === 2) {
    return {
      label: 'Level 2 · 중급',
      forTask: [
        '제한된 리소스·일정 안에서 트레이드오프가 드러나는 상황을 제시한다 (예: Must vs Nice, 채널·우선순위 갈등).',
        '요구사항은 범위 우선순위, 이해관계자별 메시지/기대치 조율, 또는 지표 후보·대시보드 관점 중 2가지 이상을 포함한다.',
        '단일 정답이 아닌, 근거를 들어 선택한 안을 설명해야 하는 구조로 만든다.',
        'Level 1보다 문맥 정보가 많지만, 여전히 "한 번의 제출"로 논리적으로 완결될 수 있게 한다.',
      ],
      forGrading:
        '이번 제출은 Level 2(중급) 과제다. 우선순위·트레이드오프·근거 제시(왜 이 선택인지)를 중점 채점하고, Level 3에서 요구하는 다층 실험 설계·리스크 정량화까지는 필수로 요구하지 마라.',
    }
  }
  return {
    label: 'Level 3 · 고급',
    forTask: [
      '성과 검증을 위한 KPI·가설·실험(또는 분석) 설계, 성공/실패 기준이 자연스럽게 포함되는 시나리오로 만든다.',
      '단기 실행과 중기 학습(반복 개선)을 동시에 고려하게 할 것.',
      '이해관계자(경영·제품·마케팅·운영 등) 관점 차이와 리스크를 드러낸다.',
      '답변에는 측정 지표, 기간, 대상, 의사결정 포인트가 구체적으로 드러나야 한다.',
    ],
    forGrading:
      '이번 제출은 Level 3(고급) 과제다. KPI·실험/분석 설계의 타당성, 가설·지표·성공 기준의 일관성, 리스크와 다음 액션의 구체성을 엄격히 채점하라.',
  }
}

/**
 * 레벨(1~3)마다 15가지 출제 유형 풀이 있다고 가정하고, variantIndex(1~15)에 해당하는
 * 스타일의 **새로운** 주관식 실무 과제를 생성한다. (JSON만 반환)
 * {
 *   domain, taskTitle, situation, requirements[], constraints[], variantIndex
 * }
 */
export async function generateRandomSimulationTask({ roleId = 'pm', levelIndex = 1, variantIndex = 1 }) {
  if (!OPENAI_API_KEY) {
    if (typeof window !== 'undefined') {
      alert('OpenAI API 키가 설정되어 있지 않습니다. .env의 VITE_OPENAI_API_KEY 값을 확인해 주세요.')
    }
    throw new Error('OPENAI API 키가 설정되어 있지 않습니다. .env에 VITE_OPENAI_API_KEY를 확인하세요.')
  }

  const roleLabel = buildRoleKoreanLabel(roleId)
  const levelLabel =
    levelIndex === 1 ? 'Level 1 기본' : levelIndex === 2 ? 'Level 2 중급' : 'Level 3 고급'
  const diff = getLevelDifficultyCriteria(levelIndex)
  const difficultyBlock = [`[${diff.label} 출제 기준 — 반드시 준수]`, ...diff.forTask.map((line) => `- ${line}`)].join(
    '\n',
  )

  const systemPrompt =
    '너는 커리어 체험 플랫폼 자빅스(JOB-EX)의 출제자야. ' +
    '각 직무별·난이도별로 15가지 서로 다른 문제 유형(시나리오 축)이 있다고 가정하고, ' +
    '지정된 유형 번호에 맞는 구체적이고 현실적인 주관식 과제를 한 세트만 생성해. ' +
    '반드시 JSON만 출력해. (마크다운·코드펜스 금지)'

  const userPrompt = [
    `직무: ${roleLabel} (내부 코드: ${roleId})`,
    `난이도: ${levelLabel} (step 번호 ${levelIndex})`,
    `이번에 선택된 문제 유형 번호: ${variantIndex} / 15 (같은 유형이어도 매번 다른 디테일의 시나리오로 새로 작성)`,
    '',
    difficultyBlock,
    '',
    '도메인은 우선 Edutech(에듀테크)를 기본으로 하되, 직무에 더 자연스러운 도메인이 있으면 domain 필드에 그 도메인명을 한글 또는 영문으로 적어도 됨.',
    '',
    '과제 본문은 한국어로 작성하고, 다음 JSON 스키마를 정확히 따를 것:',
    '{',
    '  "domain": "string",',
    '  "taskTitle": "string (예: Step 1 PM (서비스/프로덕트 기획) Level 1 기본 과제)",',
    '  "situation": "string (한 문단 이상. 실제 업무 상황처럼 구체적으로.)",',
    '  "requirements": ["요구사항1", "요구사항2", "요구사항3"],',
    '  "constraints": ["제약조건1", "제약조건2"],',
    `  "variantIndex": ${variantIndex}`,
    '}',
  ].join('\n')

  const response = await axios.post(
    OPENAI_API_URL,
    {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.85,
      response_format: { type: 'json_object' },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    },
  )

  const content = response?.data?.choices?.[0]?.message?.content
  if (!content) throw new Error('OpenAI 응답에서 내용을 찾을 수 없습니다.')

  let parsed = null
  try {
    parsed = JSON.parse(content)
  } catch (e) {
    const match = content.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        parsed = JSON.parse(match[0])
      } catch {
        parsed = null
      }
    }
  }

  return { raw: content, parsed }
}

/**
 * 1~3단계 제출: 답변 분석 + 보완점 + 모범 답안(베스트 답변)을 단일 호출로 생성
 * 반환 스키마(가능한 한):
 * {
 *   "문제해결력": {"score": number, "reason": string},
 *   "커뮤니케이션": {...},
 *   "직무이해력": {...},
 *   "완수율": {...},
 *   "전문지식": {...},
 *   "improvements": [string, ...],
 *   "best_answer": "string",
 *   "step_summary": "string"
 * }
 */
export async function analyzeSimulationStepWithOpenAI({
  answerText,
  roleId = 'pm',
  stepNumber = 1,
  taskTitle = '',
  situation = '',
  requirements = [],
  constraints = [],
  isResubmission = false,
}) {
  console.log('VITE_OPENAI_API_KEY loaded?', !!OPENAI_API_KEY)

  if (!OPENAI_API_KEY) {
    if (typeof window !== 'undefined') {
      alert('OpenAI API 키가 설정되어 있지 않습니다. .env의 VITE_OPENAI_API_KEY 값을 확인해 주세요.')
    }
    throw new Error('OPENAI API 키가 설정되어 있지 않습니다. .env에 VITE_OPENAI_API_KEY를 확인하세요.')
  }

  const focus = buildRoleFocus(roleId)
  const diff = getLevelDifficultyCriteria(stepNumber)
  const gradingLine = diff.forGrading

  const systemPrompt =
    '너는 커리어 체험 플랫폼 자빅스(JOB-EX)의 실무 코치이자 채점자야. ' +
    '사용자의 답변을 실제 현업 기준으로 평가하고, 보완점과 모범 답안을 같이 제공해줘. ' +
    '반드시 JSON만 출력해.'

  const userPrompt = [
    `직무 관점: ${roleId} (${stepNumber}단계)`,
    `난이도 채점 기준: ${gradingLine}`,
    isResubmission
      ? '이 답안은 이전에 받은 AI 피드백을 참고해 수정·재제출한 것이다. 개선된 점과 여전히 부족한 점을 improvements·각 항목 reason에 반영해 줘.'
      : '',
    taskTitle ? `단계 과제 제목: ${taskTitle}` : '',
    situation ? `상황(Context): ${situation}` : '',
    requirements && requirements.length ? `요구사항:\n- ${requirements.join('\n- ')}` : '',
    constraints && constraints.length ? `제약조건:\n- ${constraints.join('\n- ')}` : '',
    '',
    `사용자 답변:\n${answerText}`,
    '',
    '출력 JSON 스키마(반드시 지켜줘):',
    `{
  "문제해결력": { "score": number, "reason": "string" },
  "커뮤니케이션": { "score": number, "reason": "string" },
  "직무이해력": { "score": number, "reason": "string" },
  "완수율": { "score": number, "reason": "string" },
  "전문지식": { "score": number, "reason": "string" },
  "improvements": ["string", "string", "string"],
  "best_answer": "string",
  "step_summary": "string"
}`,
    '',
    `평가 유의: ${focus}`,
  ]
    .filter(Boolean)
    .join('\n')

  const response = await axios.post(
    OPENAI_API_URL,
    {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    },
  )

  const content = response?.data?.choices?.[0]?.message?.content
  if (!content) throw new Error('OpenAI 응답에서 내용을 찾을 수 없습니다.')

  let parsed = null
  try {
    parsed = JSON.parse(content)
  } catch (e) {
    const match = content.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        parsed = JSON.parse(match[0])
      } catch {
        parsed = null
      }
    }
  }

  return { raw: content, parsed }
}

/**
 * 4단계 최종 제출: 1~3단계 답변을 종합 분석해 최종 대시보드 데이터 생성
 * 반환 JSON(가능한 한):
 * {
 *  "문제해결력": {...}, ... (5 traits)
 *  "overall_summary": "string",
 *  "strengths": ["string", ...],
 *  "next_steps": ["string", ...]
 * }
 */
export async function analyzeSimulationFinalWithOpenAI({
  roleId = 'pm',
  jobKey = 'pm',
  steps = [],
}) {
  console.log('VITE_OPENAI_API_KEY loaded?', !!OPENAI_API_KEY)

  if (!OPENAI_API_KEY) {
    if (typeof window !== 'undefined') {
      alert('OpenAI API 키가 설정되어 있지 않습니다. .env의 VITE_OPENAI_API_KEY 값을 확인해 주세요.')
    }
    throw new Error('OPENAI API 키가 설정되어 있지 않습니다. .env에 VITE_OPENAI_API_KEY를 확인하세요.')
  }

  const focus = buildRoleFocus(roleId)

  const stepsText = steps
    .map((s, idx) => {
      const n = idx + 1
      return [
        `STEP ${n}`,
        s.taskTitle ? `과제 제목: ${s.taskTitle}` : '',
        s.situation ? `상황(Context): ${s.situation}` : '',
        `사용자 답변:\n${s.answerText || ''}`,
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')

  const systemPrompt =
    '너는 커리어 체험 플랫폼 자빅스(JOB-EX)의 실무 코치이자 최종 평가관이야. ' +
    '반드시 JSON만 출력해. (텍스트 섞지 마)'

  const userPrompt = [
    `직무 관점: ${roleId} (${jobKey})`,
    `평가 유의: ${focus}`,
    '',
    '다음은 사용자의 1~3단계 제출 답변 전체입니다.',
    stepsText,
    '',
    '출력 JSON 스키마(반드시 지켜줘):',
    `{
  "문제해결력": { "score": number, "reason": "string" },
  "커뮤니케이션": { "score": number, "reason": "string" },
  "직무이해력": { "score": number, "reason": "string" },
  "완수율": { "score": number, "reason": "string" },
  "전문지식": { "score": number, "reason": "string" },
  "overall_summary": "string",
  "strengths": ["string", "string", "string"],
  "next_steps": ["string", "string", "string"]
}`,
  ].join('\n')

  const response = await axios.post(
    OPENAI_API_URL,
    {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
    },
  )

  const content = response?.data?.choices?.[0]?.message?.content
  if (!content) throw new Error('OpenAI 응답에서 내용을 찾을 수 없습니다.')

  let parsed = null
  try {
    parsed = JSON.parse(content)
  } catch (e) {
    const match = content.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        parsed = JSON.parse(match[0])
      } catch {
        parsed = null
      }
    }
  }

  return { raw: content, parsed }
}

/**
 * 최종 리포트 역량 프로필을 바탕으로, 국내 채용 시장에서 흔히 보이는 포지션 스타일의 맞춤 직무를 제안한다.
 * (실시간 공고 스크래핑 없음 — 일반적인 채용 트렌드·직무 명칭 수준의 참고용 추천)
 * 반환: { jobs: [{ title, orgType, location, employmentType, whyMatch }] }
 */
export async function suggestMatchingJobPostingsWithOpenAI({
  roleId = 'pm',
  traitsText = '',
  overallSummary = '',
  strengthsText = '',
}) {
  if (!OPENAI_API_KEY) {
    return { raw: '', parsed: null }
  }

  const track =
    roleId === 'da'
      ? '데이터 분석·BI·그로스 분석'
      : roleId === 'marketer'
        ? '퍼포먼스·브랜드·콘텐츠 마케팅'
        : '서비스·프로덕트 기획(PM)·프로덕트 오너'

  const systemPrompt =
    '너는 한국 채용 시장과 직무 구조에 익숙한 커리어 어드바이저다. ' +
    '반드시 JSON만 출력한다. 특정 구인 사이트 이름이나 URL을 응답에 넣지 마라.'

  const userPrompt = [
    '다음은 직무 시뮬레이션을 마친 사용자의 역량 프로필 요약이다.',
    `리허설 직무 축: ${track} (내부 코드: ${roleId})`,
    '',
    '[역량 점수]',
    traitsText || '(점수 정보 없음)',
    '',
    overallSummary ? `[종합 요약]\n${overallSummary}` : '',
    strengthsText ? `[강점 키워드]\n${strengthsText}` : '',
    '',
    '요구사항:',
    '- 실제 채용 공고를 조회한 것처럼 말하지 말 것. "참고용 직무 유형" 제안이다.',
    '- 국내에서 최근 자주 등장하는 직무명·포지션 스타일을 바탕으로, 이 프로필과 연결될 만한 채용 포지션을 4~5개 제안할 것.',
    '- 구체적 기업 상호·브랜드명은 쓰지 말고, "중소 IT 스타트업", "에듀테크", "대기업 디지털 계열사" 등 조직 유형만 쓸 것.',
    '- 각 항목 whyMatch는 사용자 역량 패턴과 어떻게 맞는지 1~2문장으로.',
    '',
    '출력 JSON 스키마:',
    `{
  "jobs": [
    {
      "title": "string",
      "orgType": "string",
      "location": "string",
      "employmentType": "string",
      "whyMatch": "string"
    }
  ]
}`,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.55,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      },
    )

    const content = response?.data?.choices?.[0]?.message?.content
    if (!content) return { raw: '', parsed: null }

    let parsed = null
    try {
      parsed = JSON.parse(content)
    } catch (e) {
      const match = content.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          parsed = JSON.parse(match[0])
        } catch {
          parsed = null
        }
      }
    }

    return { raw: content, parsed }
  } catch (e) {
    console.error('suggestMatchingJobPostingsWithOpenAI:', e?.message || e)
    return { raw: '', parsed: null }
  }
}

