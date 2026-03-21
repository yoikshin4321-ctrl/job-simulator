/**
 * 같은 탭에서 로그인 후 NavBar가 즉시 갱신되도록 콜백을 호출합니다.
 * Next.js가 클라이언트 번들을 나누면 모듈 인스턴스가 2개가 되어 Set이 갈라질 수 있으므로
 * 리스너는 globalThis에 한 곳만 둡니다.
 */
type Listener = () => void

const GLOBAL_KEY = '__JOB_SIM_NAV_AUTH_LISTENERS__'

function getListenerSet(): Set<Listener> {
  const g = globalThis as unknown as Record<string, Set<Listener>>
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = new Set()
  }
  return g[GLOBAL_KEY]
}

export function subscribeNavAuthRefresh(listener: Listener) {
  const set = getListenerSet()
  set.add(listener)
  return () => {
    set.delete(listener)
  }
}

export function requestNavAuthRefresh() {
  const set = getListenerSet()
  set.forEach((fn) => {
    try {
      fn()
    } catch {
      // ignore
    }
  })
}
