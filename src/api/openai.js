import axios from 'axios'

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
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

