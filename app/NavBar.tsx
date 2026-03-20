'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const AUTH_KEY = 'job_sim_auth'

const NAV_ITEMS = [
  { href: '/explore', label: '직업 탐색', match: '/explore' as const },
  { href: '/simulation', label: '시뮬레이션', match: '/simulation' as const },
  { href: '/partners', label: '대학/기업용 서비스', match: '/partners' as const },
] as const

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentInstitution, setCurrentInstitution] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)

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

  useEffect(() => {
    const readAuth = () => {
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_KEY) : null
        if (!raw) {
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

    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_KEY) {
        readAuth()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
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
    setCurrentUser(null)
    setCurrentInstitution(null)
    setMenuOpen(false)
    router.replace('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-sm w-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 min-h-16 flex flex-col">
        <div className="h-16 flex items-center justify-between gap-2">
          {/* 로고 + 데스크톱 내비 */}
          <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
            <Link
              href="/"
              className="text-lg font-bold text-indigo-600 hover:text-indigo-700 transition-colors tracking-tight flex-shrink-0"
            >
              JOB-EX
            </Link>
            <nav className="hidden md:flex items-center gap-1" aria-label="주요 메뉴">
              {NAV_ITEMS.map(({ href, label, match }) => (
                <Link key={href} href={href} className={linkClass(match)}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 우측: 모바일 메뉴 버튼 + 인증 */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200/80"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {currentInstitution ? (
              <>
                <span className="hidden sm:inline text-xs text-slate-500 truncate max-w-[140px]">
                  {currentInstitution.institutionName || '기관'} 기관 관리자
                </span>
                <Link
                  href="/institution/dashboard"
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  대시보드
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-slate-800 hover:bg-slate-900 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : currentUser ? (
              <>
                <span className="hidden sm:inline text-xs text-slate-500 truncate max-w-[120px]">
                  {currentUser.name || currentUser.email} 님
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-slate-800 hover:bg-slate-900 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 모바일·좁은 화면 전용 메뉴 패널 */}
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
          </div>
        )}
      </div>
    </header>
  )
}
