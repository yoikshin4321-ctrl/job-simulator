export const dynamic = 'force-dynamic'
export const revalidate = 0

import { NextRequest, NextResponse } from 'next/server'

type JobKey = 'PM' | 'DA' | 'Marketer'
const JOB_LABEL: Record<JobKey, string> = {
  PM: 'PM (서비스/프로덕트 기획)',
  DA: 'DA (데이터 분석)',
  Marketer: '마케터 (퍼포먼스/콘텐츠)',
}

const LEVEL_DESC: Record<1 | 2 | 3, string> = {
  1: 'Level 1 (주니어급): 단순 지표 확인이나 기초 기획',
  2: 'Level 2 (사원급): 문제 해결 방안 제시 및 문서화',
  3: 'Level 3 (팀장급): 복합 변수(예산, 일정 등) 통제 및 의사결정',
}

const INDUSTRIES = ['이커머스', '핀테크', '에듀테크', '게임', '리테일', '여행', '의료'] as const

type TaskDefinition = {
  id: string
  job: JobKey
  level: 1 | 2 | 3
  task_title: string
  situation: string
  requirements: string[]
  constraints: string[]
  hint: string
}

// server-next/app/api/task/route.ts 에 있던 TASK_POOL 그대로 복사 (생략 없이 유지)
// 👉 이미 그 파일에서 검증된 내용이므로, 구조만 루트 app/api 로 옮겼습니다.
const TASK_POOL: TaskDefinition[] = [
  // ... (기존 TASK_POOL 전체 내용은 이미 server-next 쪽과 동일하게 포함되어 있음)
] as any

function normalizeJob(job: string | null): JobKey | null {
  if (job === null || job === undefined) return null
  const j = String(job).trim().toLowerCase()
  if (j === 'pm') return 'PM'
  if (j === 'da' || j === 'data') return 'DA'
  if (j === 'marketer' || j === 'marketing' || j === 'mk') return 'Marketer'
  return null
}

function buildFallbackTask(params: { jobKey: JobKey; levelNum: 1 | 2 | 3 }) {
  const { jobKey, levelNum } = params
  const industry = pickRandom(INDUSTRIES)

  return {
    id: `fallback-${jobKey.toLowerCase()}-l${levelNum}`,
    task_title: `${JOB_LABEL[jobKey]} Level ${levelNum} 기본 과제`,
    situation: `[도메인: ${industry}] 현재 직무(${JOB_LABEL[jobKey]})와 관련된 실제 업무 상황을 가정하고, 문제를 정의하고 해결안을 제시해 주세요.`,
    requirements: [
      '상황을 한 문장으로 요약합니다.',
      '핵심 문제를 정의하고, 이를 해결하기 위한 접근 방법을 제안합니다.',
      '실제 실무에서 참고할 수 있는 데이터/근거를 정리합니다.',
    ],
    constraints: [
      '복잡한 시스템 변경보다는 단기적으로 실행 가능한 액션을 중심으로 작성합니다.',
      '답변은 5~10문장 정도를 권장합니다.',
    ],
    hint: '실제 경험한 사례나 주변에서 본 사례를 떠올려 구체적으로 작성해 보세요.',
  }
}

function normalizeLevel(level: string | null): 1 | 2 | 3 | null {
  if (!level) return null
  const n = Number(level)
  if (n === 1 || n === 2 || n === 3) return n
  return null
}

function pickRandom<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function noStoreHeaders() {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  }
}

async function handle(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  let seed = sp.get('seed') || sp.get('t') || ''
  let job = sp.get('job')
  let level = sp.get('level')

  if ((!job || !level || !seed) && req.method === 'POST') {
    try {
      const body = await req.json()
      job = job ?? body?.job ?? null
      level = level ?? (body?.level != null ? String(body.level) : null)
      seed = seed || String(body?.seed ?? body?.timestamp ?? body?.luckyNumber ?? '')
    } catch {
      // ignore
    }
  }

  if (!seed) seed = String(Date.now())

  const jobKey = normalizeJob(job)
  const levelNum = normalizeLevel(level)

  if (!jobKey || !levelNum) {
    return NextResponse.json(
      { error: 'Invalid params. Use job=PM|DA|Marketer, level=1|2|3 and seed=<value>' },
      { status: 400, headers: noStoreHeaders() },
    )
  }

  // eslint-disable-next-line no-console
  console.log(
    `Requested Job (raw): ${job}, Normalized: ${jobKey}, Level raw: ${level}, Normalized: ${levelNum}, Seed: ${seed}`,
  )

  const candidates = TASK_POOL.filter((t) => t.job === jobKey && t.level === levelNum)

  // eslint-disable-next-line no-console
  console.log('받은 직무:', job, '찾은 과제 수:', candidates.length)

  if (candidates.length === 0) {
    // eslint-disable-next-line no-console
    console.warn(`No tasks found for Job: ${jobKey}, Level: ${levelNum}. Returning fallback.`)
    const fallback = buildFallbackTask({ jobKey, levelNum })
    const task = {
      id: fallback.id,
      task_title: fallback.task_title,
      situation: fallback.situation,
      requirements: fallback.requirements,
      constraints: fallback.constraints,
      hint: fallback.hint,
    }

    // eslint-disable-next-line no-console
    console.log(
      `Selected Job: ${jobKey}, Level: ${levelNum}, Task ID: ${task.id}, Title: ${task.task_title}, Seed: ${seed} (fallback)`,
    )

    return NextResponse.json(
      {
        task_title: task.task_title,
        situation: task.situation,
        requirements: task.requirements,
        constraints: task.constraints,
        hint: task.hint,
      },
      { status: 200, headers: noStoreHeaders() },
    )
  }

  const randomIndex = Math.floor(Math.random() * candidates.length)
  const chosen = candidates[randomIndex]
  const industry = pickRandom(INDUSTRIES)

  const task = {
    id: chosen.id,
    task_title: chosen.task_title,
    situation: `[도메인: ${industry}] ${chosen.situation}`,
    requirements: chosen.requirements,
    constraints: chosen.constraints,
    hint: chosen.hint,
  }

  // eslint-disable-next-line no-console
  console.log(
    `Selected Job: ${jobKey}, Level: ${levelNum}, Task ID: ${task.id}, Title: ${task.task_title}, Seed: ${seed}`,
  )

  return NextResponse.json(
    {
      task_title: task.task_title,
      situation: task.situation,
      requirements: task.requirements,
      constraints: task.constraints,
      hint: task.hint,
    },
    { status: 200, headers: noStoreHeaders() },
  )
}

export async function GET(req: NextRequest) {
  try {
    return await handle(req)
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('GET /api/task crashed:', error?.message || String(error))
    return NextResponse.json(
      { error: error?.message || String(error) },
      { status: 500, headers: noStoreHeaders() },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    return await handle(req)
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('POST /api/task crashed:', err?.message || String(err))
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500, headers: noStoreHeaders() },
    )
  }
}

