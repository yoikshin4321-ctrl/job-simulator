import fs from 'fs'
import path from 'path'
import { chromium } from 'playwright'

const projectRoot = process.cwd()
const baseUrl = 'http://localhost:3000'

const outDir = path.join(projectRoot, 'wireframe-output')
const shotsDir = path.join(outDir, 'shots')

fs.mkdirSync(shotsDir, { recursive: true })

// -----------------------------
// LocalStorage seeds (for demo screenshots)
// -----------------------------
const seedStudent = (() => {
  const studentEmail = 'student@example.com'
  const studentName = '김학생'
  const institutionCode = 'UNI-001'

  const auth = {
    currentUser: { email: studentEmail, name: studentName },
    currentInstitution: null,
    users: [
      {
        name: studentName,
        email: studentEmail,
        password: 'pass123',
        school: 'OO대학교',
        major: '마케팅',
        status: '대학교 재학',
        interests: ['PM', '데이터 분석'],
        institutionCode,
        createdAt: new Date().toISOString(),
      },
    ],
    institutions: [
      {
        institutionName: 'OO대학교(가상)',
        institutionCode,
        adminEmail: 'admin@univ.com',
        password: 'adminpass',
        createdAt: new Date().toISOString(),
      },
    ],
  }

  // Keep history entries minimal but valid for /result and /my and /institution/dashboard.
  const trait = (score) => ({ score, reason: 'stub' })
  const resultObj = {
    문제해결력: trait(78),
    커뮤니케이션: trait(74),
    직무이해력: trait(80),
    완수율: trait(72),
    전문지식: trait(82),
    overall_summary: '이것은 와이어프레임 캡처를 위한 더미 결과입니다.',
    strengths: ['문제정의', '커뮤니케이션', '실행 방향성'],
    next_steps: ['다음 과제에 우선순위 반영', '근거 제시 강화', '실행 계획 구체화'],
  }

  const runId = 'run-001'
  const now = Date.now()
  const history = [
    {
      roleId: 'pm',
      levelIndex: 1,
      levelLabel: 'Step 1 PM · Level 1',
      answer: 'stub answer',
      result: {
        문제해결력: trait(76),
        커뮤니케이션: trait(72),
        직무이해력: trait(79),
        완수율: trait(70),
        전문지식: trait(81),
      },
      analyzedAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      studentEmail,
      studentName,
      institutionCode,
      runId,
      isResubmission: false,
    },
    {
      roleId: 'pm',
      levelIndex: 2,
      levelLabel: 'Step 2 PM · Level 2',
      answer: 'stub answer',
      result: {
        문제해결력: trait(80),
        커뮤니케이션: trait(74),
        직무이해력: trait(81),
        완수율: trait(73),
        전문지식: trait(83),
      },
      analyzedAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
      studentEmail,
      studentName,
      institutionCode,
      runId,
      isResubmission: false,
    },
  ]

  return {
    auth: JSON.stringify(auth),
    history: JSON.stringify(history),
    result: JSON.stringify({ roleId: 'pm', result: resultObj, analyzedAt: new Date().toISOString(), studentEmail, studentName, institutionCode, runId }),
  }
})()

const seedInstitution = (() => {
  const studentEmail = 'student@example.com'
  const studentName = '김학생'
  const institutionCode = 'UNI-001'
  const institutionName = 'OO대학교(가상)'

  const trait = (score) => ({ score, reason: 'stub' })
  const runId = 'run-001'
  const now = Date.now()

  const auth = {
    currentUser: null,
    currentInstitution: {
      adminEmail: 'admin@univ.com',
      institutionName,
      institutionCode,
    },
    users: [
      {
        name: studentName,
        email: studentEmail,
        password: 'pass123',
        school: 'OO대학교',
        major: '마케팅',
        status: '대학교 재학',
        interests: ['PM', '데이터 분석'],
        institutionCode,
        createdAt: new Date().toISOString(),
      },
    ],
    institutions: [
      {
        institutionName,
        institutionCode,
        adminEmail: 'admin@univ.com',
        password: 'adminpass',
        createdAt: new Date().toISOString(),
      },
    ],
  }

  const history = [
    {
      roleId: 'pm',
      levelIndex: 1,
      levelLabel: 'Step 1 PM · Level 1',
      answer: 'stub answer',
      result: {
        문제해결력: trait(76),
        커뮤니케이션: trait(72),
        직무이해력: trait(79),
        완수율: trait(70),
        전문지식: trait(81),
      },
      analyzedAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      studentEmail,
      studentName,
      institutionCode,
      runId,
      isResubmission: false,
    },
  ]

  return {
    auth: JSON.stringify(auth),
    history: JSON.stringify(history),
  }
})()

function openAIStubbedResponse(systemContent = '') {
  const asTask = () => {
    const content = JSON.stringify({
      domain: 'Edutech',
      taskTitle: 'Step 1 PM · Level 1 기본 과제 (stub)',
      situation: '실제 업무처럼 주어진 상황을 바탕으로, 우선순위/다음 액션 1~2가지를 중심으로 답변해 주세요.',
      requirements: ['상황 이해', '핵심 문제 정의', '실행 가능한 다음 단계 제시'],
      constraints: ['단기간 실행 가능한 액션 위주로 작성할 것.'],
      variantIndex: 1,
    })
    return content
  }

  const asStepAnalysis = () => {
    const content = JSON.stringify({
      문제해결력: { score: 80, reason: 'stub reason' },
      커뮤니케이션: { score: 74, reason: 'stub reason' },
      직무이해력: { score: 78, reason: 'stub reason' },
      완수율: { score: 72, reason: 'stub reason' },
      전문지식: { score: 82, reason: 'stub reason' },
      improvements: ['근거를 한 단계 더 구체화', '우선순위를 Must/Nice로 분리', '다음 액션을 1~2개로 좁히기'],
      best_answer: 'stub best answer',
      step_summary: 'stub step summary',
    })
    return content
  }

  const asFinalAnalysis = () => {
    const content = JSON.stringify({
      문제해결력: { score: 78, reason: 'stub reason' },
      커뮤니케이션: { score: 74, reason: 'stub reason' },
      직무이해력: { score: 80, reason: 'stub reason' },
      완수율: { score: 72, reason: 'stub reason' },
      전문지식: { score: 82, reason: 'stub reason' },
      overall_summary: 'stub overall summary',
      strengths: ['문제정의', '커뮤니케이션', '실행 방향성'],
      next_steps: ['우선순위 정교화', '근거 확장', '실행 계획 구체화'],
    })
    return content
  }

  const asJobSuggestions = () => {
    const content = JSON.stringify({
      jobs: [
        {
          title: '주니어 PM (기획/운영)',
          orgType: 'IT·플랫폼 스타트업',
          location: '서울',
          employmentType: '정규직',
          whyMatch: 'stub whyMatch 1',
        },
        {
          title: '서비스 기획자 (제품/성장)',
          orgType: '중소 IT 서비스 기업',
          location: '경기·서울',
          employmentType: '정규직',
          whyMatch: 'stub whyMatch 2',
        },
        {
          title: '신사업/전략 기획',
          orgType: '에듀테크',
          location: '서울 (하이브리드)',
          employmentType: '계약직 → 정규직',
          whyMatch: 'stub whyMatch 3',
        },
        {
          title: 'CX/운영 기획',
          orgType: '커머스·라이프스타일 앱',
          location: '서울',
          employmentType: '정규직',
          whyMatch: 'stub whyMatch 4',
        },
      ],
    })
    return content
  }

  if (systemContent.includes('출제자')) return asTask()
  if (systemContent.includes('채점자')) return asStepAnalysis()
  if (systemContent.includes('최종 평가관')) return asFinalAnalysis()
  if (systemContent.includes('커리어 어드바이저')) return asJobSuggestions()

  return asStepAnalysis()
}

async function seedLocalStorage(page, seed) {
  if (!seed) return
  await page.addInitScript((s) => {
    try {
      localStorage.setItem('job_sim_auth', s.auth ?? '')
      if (s.history) localStorage.setItem('job_sim_ai_history', s.history)
      if (s.result) localStorage.setItem('job_sim_ai_result', s.result)
    } catch {
      // ignore
    }
  }, seed)
}

async function clearLocalStorage(page) {
  await page.addInitScript(() => {
    try {
      localStorage.clear()
    } catch {
      // ignore
    }
  })
}

async function captureOne({ context, url, key, seed }) {
  const page = await context.newPage()

  await clearLocalStorage(page)

  if (seed) {
    await seedLocalStorage(page, seed)
  }

  await page.route('https://api.openai.com/v1/chat/completions', async (route) => {
    try {
      const req = route.request()
      const postData = req.postData() || '{}'
      const body = JSON.parse(postData)
      const system = body?.messages?.find((m) => m.role === 'system')?.content || ''
      const content = openAIStubbedResponse(system)

      return await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          choices: [{ message: { content } }],
        }),
      })
    } catch {
      return await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          choices: [{ message: { content: JSON.stringify({}) } }],
        }),
      })
    }
  })

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  // Let React effects settle and spinners disappear a bit.
  await page.waitForTimeout(1800)
  await page.screenshot({ path: path.join(shotsDir, `${key}.png`), fullPage: false })
  await page.close()
}

const pagesToCapture = [
  // Public / entry
  { key: 'home', urlPath: '/', state: 'student' },
  { key: 'about', urlPath: '/about', state: 'student' },
  { key: 'explore', urlPath: '/explore', state: 'student' },
  { key: 'partners', urlPath: '/partners', state: 'student' },
  { key: 'mvp-demo', urlPath: '/mvp-demo', state: 'student' },
  { key: 'simulation-index', urlPath: '/simulation', state: 'student' },

  // Simulation dynamic routes
  { key: 'simulation-pm', urlPath: '/simulation/pm', state: 'student' },
  { key: 'simulation-da', urlPath: '/simulation/da', state: 'student' },
  { key: 'simulation-marketer', urlPath: '/simulation/marketer', state: 'student' },

  // Result & report (needs seeded history/result to avoid empty state)
  { key: 'result', urlPath: '/result', state: 'student' },
  { key: 'report', urlPath: '/report?role=pm', state: 'student' },

  // Student account pages (need currentUser)
  { key: 'my', urlPath: '/my', state: 'student' },
  { key: 'institution-verify', urlPath: '/institution-verify', state: 'student' },

  // Guest auth pages (no redirect)
  { key: 'login', urlPath: '/login', state: 'guest' },
  { key: 'signup', urlPath: '/signup', state: 'guest' },

  // Terms / privacy
  { key: 'terms', urlPath: '/terms', state: 'guest' },
  { key: 'privacy', urlPath: '/privacy', state: 'guest' },

  // Institution auth + dashboard
  { key: 'institution-signup', urlPath: '/institution-signup', state: 'guest' },
  { key: 'institution-login', urlPath: '/institution-login', state: 'guest' },
  { key: 'institution-dashboard', urlPath: '/institution/dashboard', state: 'institution' },
]

const getSeed = (state) => {
  if (state === 'student') return seedStudent
  if (state === 'institution') return seedInstitution
  return null
}

const nodeLayout = {
  home: { x: 220, y: 500, w: 260, h: 150, label: 'Home /' },
  'simulation-index': { x: 560, y: 380, w: 260, h: 150, label: '/simulation' },
  about: { x: 560, y: 560, w: 260, h: 150, label: '/about' },
  explore: { x: 560, y: 740, w: 260, h: 150, label: '/explore' },

  'simulation-pm': { x: 880, y: 270, w: 260, h: 150, label: '/simulation/pm' },
  'simulation-da': { x: 1180, y: 270, w: 260, h: 150, label: '/simulation/da' },
  'simulation-marketer': { x: 880, y: 450, w: 260, h: 150, label: '/simulation/marketer' },
  result: { x: 1180, y: 450, w: 260, h: 150, label: '/result' },
  report: { x: 1450, y: 450, w: 260, h: 150, label: '/report' },

  partners: { x: 880, y: 740, w: 260, h: 150, label: '/partners' },
  'mvp-demo': { x: 1180, y: 740, w: 260, h: 150, label: '/mvp-demo' },

  login: { x: 220, y: 710, w: 260, h: 150, label: '/login' },
  signup: { x: 220, y: 860, w: 260, h: 150, label: '/signup' },
  my: { x: 560, y: 900, w: 260, h: 150, label: '/my' },

  terms: { x: 220, y: 260, w: 260, h: 150, label: '/terms' },
  privacy: { x: 220, y: 320, w: 260, h: 150, label: '/privacy' },

  'institution-verify': { x: 880, y: 630, w: 260, h: 150, label: '/institution-verify' },
  'institution-signup': { x: 1450, y: 260, w: 260, h: 150, label: '/institution-signup' },
  'institution-login': { x: 1450, y: 410, w: 260, h: 150, label: '/institution-login' },
  'institution-dashboard': { x: 1450, y: 630, w: 260, h: 150, label: '/institution/dashboard' },
}

const edges = [
  ['home', 'simulation-index'],
  ['home', 'about'],
  ['home', 'explore'],
  ['home', 'terms'],
  ['home', 'privacy'],
  ['home', 'login'],

  ['simulation-index', 'simulation-pm'],
  ['simulation-index', 'simulation-da'],
  ['simulation-index', 'simulation-marketer'],
  ['simulation-pm', 'result'],
  ['simulation-da', 'result'],
  ['simulation-marketer', 'result'],
  ['result', 'report'],

  ['about', 'partners'],
  ['about', 'mvp-demo'],

  ['login', 'signup'],
  ['signup', 'my'],
  ['my', 'institution-verify'],

  ['institution-verify', 'institution-dashboard'],
  ['home', 'institution-signup'],
  ['institution-signup', 'institution-login'],
  ['institution-login', 'institution-dashboard'],
]

function nodeCenter(node) {
  return { cx: node.x + node.w / 2, cy: node.y + node.h / 2 }
}

function edgePath(fromKey, toKey) {
  const a = nodeLayout[fromKey]
  const b = nodeLayout[toKey]
  if (!a || !b) return ''
  const { cx: x1, cy: y1 } = nodeCenter(a)
  const { cx: x2, cy: y2 } = nodeCenter(b)
  const dx = (x2 - x1) * 0.35
  const c1x = x1 + dx
  const c1y = y1
  const c2x = x2 - dx
  const c2y = y2
  return `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`
}

function buildWireframeHtml() {
  const bg = '#0b1220'
  const line = 'rgba(148,163,184,0.65)'
  const nodeBorder = 'rgba(226,232,240,0.55)'
  const labelColor = 'rgba(226,232,240,0.85)'

  const w = 1920
  const h = 1080
  const nodeKeys = Object.keys(nodeLayout)

  const linesSvg = edges
    .map((e) => {
      const d = edgePath(e[0], e[1])
      if (!d) return ''
      return `<path d="${d}" stroke="${line}" stroke-width="5" fill="none" stroke-linecap="round" />`
    })
    .join('\n')

  const nodesHtml = nodeKeys
    .map((k) => {
      const n = nodeLayout[k]
      const imgPath = `shots/${k}.png`
      return `
      <div class="node" style="left:${n.x}px; top:${n.y}px; width:${n.w}px; height:${n.h}px;">
        <img class="thumb" src="${imgPath}" alt="${n.label}" />
        <div class="label">${n.label}</div>
      </div>`
    })
    .join('\n')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Wireframe</title>
  <style>
    html, body { margin:0; padding:0; width:${w}px; height:${h}px; background:${bg}; overflow:hidden; }
    .wrap { position:relative; width:${w}px; height:${h}px; background:${bg}; }
    svg { position:absolute; left:0; top:0; width:${w}px; height:${h}px; pointer-events:none; }
    .node { position:absolute; border:2px solid ${nodeBorder}; border-radius:14px; background:rgba(255,255,255,0.03); box-shadow: 0 10px 30px rgba(0,0,0,0.35); overflow:hidden; }
    .thumb { width:100%; height:calc(100% - 26px); object-fit:cover; filter: grayscale(1) contrast(1.1) brightness(1.05); opacity:0.95; }
    .label { position:absolute; left:0; bottom:0; right:0; height:26px; display:flex; align-items:center; padding:0 10px; font-family: Arial, Helvetica, sans-serif; font-size:12px; color:${labelColor}; background: rgba(2,6,23,0.75); border-top:1px solid rgba(226,232,240,0.25); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  </style>
</head>
<body>
  <div class="wrap">
    <svg viewBox="0 0 ${w} ${h}">
      ${linesSvg}
    </svg>
    ${nodesHtml}
  </div>
</body>
</html>`
}

async function composeScreenshot() {
  const html = buildWireframeHtml()
  const htmlPath = path.join(outDir, 'wireframe.html')
  fs.writeFileSync(htmlPath, html, 'utf8')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
  const page = await context.newPage()

  const fileUrl = `file://${htmlPath}`
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(400)

  const finalPng = path.join(outDir, 'final-wireframe.png')
  await page.screenshot({ path: finalPng, fullPage: false })

  await page.close()
  await context.close()
  await browser.close()
}

async function main() {
  // 1) Capture screenshots
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 })

  for (const p of pagesToCapture) {
    const seed = getSeed(p.state)
    const url = `${baseUrl}${p.urlPath}`
    console.log(`Capturing ${p.key} -> ${url}`)
    await captureOne({ context, url, key: p.key, seed })
  }

  await context.close()
  await browser.close()

  // 2) Compose wireframe into a single image
  await composeScreenshot()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

