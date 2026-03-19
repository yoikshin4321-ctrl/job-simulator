import axios from 'axios'

// Vercel(Next) + Vite 환경 모두에서 안전하게 동작하도록 env 접근을 방어적으로 처리
// 1순위: Node/Next 서버의 process.env.VITE_OPENAI_API_KEY
// 2순위: Vite 클라이언트의 import.meta.env.VITE_OPENAI_API_KEY
// 그 외: 빈 문자열
const OPENAI_API_KEY =
  (typeof process !== 'undefined' && process.env && process.env.VITE_OPENAI_API_KEY) ||
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
}) {
  console.log('VITE_OPENAI_API_KEY loaded?', !!OPENAI_API_KEY)

  if (!OPENAI_API_KEY) {
    if (typeof window !== 'undefined') {
      alert('OpenAI API 키가 설정되어 있지 않습니다. .env의 VITE_OPENAI_API_KEY 값을 확인해 주세요.')
    }
    throw new Error('OPENAI API 키가 설정되어 있지 않습니다. .env에 VITE_OPENAI_API_KEY를 확인하세요.')
  }

  const focus = buildRoleFocus(roleId)

  const systemPrompt =
    '너는 커리어 체험 플랫폼 자빅스(JOB-EX)의 실무 코치이자 채점자야. ' +
    '사용자의 답변을 실제 현업 기준으로 평가하고, 보완점과 모범 답안을 같이 제공해줘. ' +
    '반드시 JSON만 출력해.'

  const userPrompt = [
    `직무 관점: ${roleId} (${stepNumber}단계)`,
    taskTitle ? `단계 과제 제목: ${taskTitle}` : '',
    situation ? `상황(Context): ${situation}` : '',
    requirements && requirements.length ? `요구사항:\n- ${requirements.join('\n- ')}` : '',
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

