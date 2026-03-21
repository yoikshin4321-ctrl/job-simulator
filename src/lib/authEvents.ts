/** 같은 탭에서 localStorage를 바꿔도 `storage` 이벤트는 안 뜨므로, NavBar 등이 즉시 갱신되도록 브로드캐스트 */
export const JOB_SIM_AUTH_UPDATED_EVENT = 'job-sim-auth-updated'

export function notifyAuthStorageUpdated() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(JOB_SIM_AUTH_UPDATED_EVENT))
}
