'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { JOB_SIM_AUTH_UPDATED_EVENT, notifyAuthStorageUpdated } from '../src/lib/authEvents'
import { subscribeNavAuthRefresh } from '../src/lib/navAuthSync'
import { supabase } from '../src/lib/supabaseClient'
import { getInstitutionByAdmin, getProfileByUserId } from '../src/lib/supabaseDb'

const AUTH_KEY = 'job_sim_auth'

const NAV_ITEMS = [
  { href: '/explore', label: '직업 탐색', match: '/explore' as const },
  { href: '/simulation', label: '시뮬레이션', match: '/simulation' as const },
  { href: '/partners', label: '대학/기업용 서비스', match: '/partners' as const },
] as const

function applyAuthFromLocalStorage(): { user: any; institution: any } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      user: parsed?.currentUser ?? null,
      institution: parsed?.currentInstitution ?? null,
    }
  } catch {
    return null
  }
}

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentInstitution, setCurrentInstitution] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const readAuthGenRef = useRef(0)

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname?.startsWith(path)
  }

  const linkClass = (path: string) =>
    `px-4 py-2 text-sm font-medium transition-colors rounded-xl ${
      isActive(path)
        ? 'text-indigo-600 bg-indigo-50'
        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
    }`

  const mobileLinkClass = (path: string) =>
    `block w-full text-left px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
      isActive(path) ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700 hover:bg-slate-50'
    }`

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // 로그인/가입 후 router.replace로 경로만 바뀌는 경우, 번들 분리로 requestNavAuthRefresh가
  // 빈 Set을 호출할 수 있어 여기서 localStorage와 헤더 상태를 다시 맞춤
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(AUTH_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      setCurrentUser(parsed?.currentUser ?? null)
      setCurrentInstitution(parsed?.currentInstitution ?? null)
    } catch {
      // ignore
    }
  }, [pathname])

  useEffect(() => {
    const readAuth = () => {
      const gen = ++readAuthGenRef.current
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_KEY) : null
        if (!raw) {
          if (supabase) {
            void (async () => {
              try {
                const { data } = await supabase.auth.getSession()
                if (gen !== readAuthGenRef.current) return
                const fromLs = applyAuthFromLocalStorage()
                if (fromLs && (fromLs.user || fromLs.institution)) {
                  setCurrentUser(fromLs.user)
                  setCurrentInstitution(fromLs.institution)
                  return
                }

                const session = data?.session
                if (!session) {
                  if (gen !== readAuthGenRef.current) return
                  const again = applyAuthFromLocalStorage()
                  if (again && (again.user || again.institution)) {
                    setCurrentUser(again.user)
                    setCurrentInstitution(again.institution)
                    return
                  }
                  setCurrentUser(null)
                  setCurrentInstitution(null)
                  return
                }

                const prof = await getProfileByUserId(session.user.id)
                if (gen !== readAuthGenRef.current) return
                const fromLs2 = applyAuthFromLocalStorage()
                if (fromLs2 && (fromLs2.user || fromLs2.institution)) {
                  setCurrentUser(fromLs2.user)
                  setCurrentInstitution(fromLs2.institution)
                  return
                }

                if (!prof) {
                  setCurrentUser(null)
                  setCurrentInstitution(null)
                  return
                }

                if (prof.role === 'institution_admin') {
                  const inst = await getInstitutionByAdmin(session.user.id)
                  if (gen !== readAuthGenRef.current) return
                  setCurrentInstitution(
                    inst
                      ? { institutionName: inst.institution_name, institutionCode: inst.institution_code }
                      : { institutionName: '기관', institutionCode: '' },
                  )
                  setCurrentUser(null)
                } else {
                  setCurrentInstitution(null)
                  setCurrentUser({ email: session.user.email, name: prof.name })
                }
              } catch {
                if (gen !== readAuthGenRef.current) return
                const fromLs = applyAuthFromLocalStorage()
                if (fromLs && (fromLs.user || fromLs.institution)) {
                  setCurrentUser(fromLs.user)
                  setCurrentInstitution(fromLs.institution)
                  return
                }
                setCurrentUser(null)
                setCurrentInstitution(null)
              }
            })()
            return
          }

          setCurrentUser(null)
          setCurrentInstitution(null)
          return
        }
        const parsed = JSON.parse(raw)
        setCurrentUser(parsed?.currentUser || null)
        setCurrentInstitution(parsed?.currentInstitution || null)
      } catch {
        setCurrentUser(null)
        setCurrentInstitution(null)
      }
    }

    readAuth()

    const unsubSync = subscribeNavAuthRefresh(readAuth)

    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_KEY) readAuth()
    }
    const onSameTab = () => readAuth()

    window.addEventListener('storage', onStorage)
    window.addEventListener(JOB_SIM_AUTH_UPDATED_EVENT, onSameTab)

    const subscription = supabase?.auth?.onAuthStateChange?.(() => {
      readAuth()
    })

    const unsubAuth = subscription?.data?.subscription

    return () => {
      unsubSync()
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(JOB_SIM_AUTH_UPDATED_EVENT, onSameTab)
      unsubAuth?.unsubscribe()
    }
  }, [])

  const handleLogout = () => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw)
        const next = { ...(parsed || {}), currentUser: null, currentInstitution: null }
        window.localStorage.setItem(AUTH_KEY, JSON.stringify(next))
      }
    } catch {
      // ignore
    }
    if (supabase) {
      void supabase.auth.signOut().catch(() => {})
    }
    setCurrentUser(null)
    setCurrentInstitution(null)
    setMenuOpen(false)
    notifyAuthStorageUpdated()
    router.replace('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-sm w-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 min-h-16 flex flex-col">
        <div className="min-h-16 flex items-center justify-between gap-3 py-2 sm:py-0">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
            <Link
              href="/"
              className="text-lg font-bold text-indigo-600 hover:text-indigo-700 transition-colors tracking-tight flex-shrink-0"
            >
              JOB-EX
            </Link>
            <nav className="hidden md:flex items-center gap-1 flex-wrap" aria-label="주요 메뉴">
              {NAV_ITEMS.map(({ href, label, match }) => (
                <Link key={href} href={href} className={linkClass(match)}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* md 이상: 헤더에 인증 UI (flex-wrap으로 좁은 태블릿도 겹침 방지) */}
          <div className="hidden md:flex items-center flex-wrap justify-end gap-x-2 gap-y-2 min-w-0 max-w-[min(100%,22rem)] lg:max-w-none">
            {currentInstitution ? (
              <>
                <span className="text-xs text-slate-500 truncate max-w-[8rem] lg:max-w-[10rem]">
                  {currentInstitution.institutionName || '기관'} 기관 관리자
                </span>
                <Link
                  href="/institution/dashboard"
                  className="px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
                >
                  대시보드
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-slate-800 hover:bg-slate-900 transition-colors whitespace-nowrap shrink-0"
                >
                  로그아웃
                </button>
              </>
            ) : currentUser ? (
              <>
                <span className="text-xs text-slate-500 truncate max-w-[6rem] lg:max-w-[9rem]" title={currentUser.name || currentUser.email}>
                  {currentUser.name || currentUser.email} 님
                </span>
                <Link
                  href="/my"
                  className="px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0"
                >
                  내 정보
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-slate-800 hover:bg-slate-900 transition-colors whitespace-nowrap shrink-0"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200/80 shrink-0"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div
            id="mobile-nav"
            className="md:hidden border-t border-slate-200/80 py-3 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 bg-white"
          >
            <nav className="flex flex-col gap-1" aria-label="모바일 메뉴">
              {NAV_ITEMS.map(({ href, label, match }) => (
                <Link key={href} href={href} className={mobileLinkClass(match)} onClick={() => setMenuOpen(false)}>
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
              {currentInstitution ? (
                <>
                  <p className="px-4 text-xs text-slate-500">
                    {currentInstitution.institutionName || '기관'} 기관 관리자
                  </p>
                  <Link
                    href="/institution/dashboard"
                    className="mx-2 inline-flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    대시보드
                  </Link>
                  <button
                    type="button"
                    className="mx-2 inline-flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-slate-800"
                    onClick={() => {
                      setMenuOpen(false)
                      handleLogout()
                    }}
                  >
                    로그아웃
                  </button>
                </>
              ) : currentUser ? (
                <>
                  <p className="px-4 text-xs font-medium text-slate-600">{currentUser.name || currentUser.email} 님</p>
                  <Link
                    href="/my"
                    className="mx-2 inline-flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    내 정보
                  </Link>
                  <button
                    type="button"
                    className="mx-2 inline-flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-slate-800"
                    onClick={() => {
                      setMenuOpen(false)
                      handleLogout()
                    }}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="mx-2 inline-flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium text-slate-700 border border-slate-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="mx-2 inline-flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
