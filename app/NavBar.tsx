'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const AUTH_KEY = 'job_sim_auth'

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)

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

  useEffect(() => {
    const readAuth = () => {
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_KEY) : null
        if (!raw) {
          setCurrentUser(null)
          return
        }
        const parsed = JSON.parse(raw)
        setCurrentUser(parsed?.currentUser || null)
      } catch {
        setCurrentUser(null)
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
        const next = { ...(parsed || {}), currentUser: null }
        window.localStorage.setItem(AUTH_KEY, JSON.stringify(next))
      }
    } catch {
      // ignore
    }
    setCurrentUser(null)
    router.replace('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-sm w-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* 좌측 그룹: 로고 + 내비게이션 */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <Link
            href="/"
            className="text-lg font-bold text-indigo-600 hover:text-indigo-700 transition-colors tracking-tight flex-shrink-0"
          >
            JOB-EX
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/explore" className={linkClass('/explore')}>
              직업 탐색
            </Link>
            <Link href="/simulation" className={linkClass('/simulation')}>
              시뮬레이션
            </Link>
            <Link href="/about" className={linkClass('/about')}>
              대학/기업용 서비스
            </Link>
          </nav>
        </div>

        {/* 우측: 인증 관련 버튼 */}
        <div className="flex items-center gap-2 ml-auto">
          {currentUser ? (
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
    </header>
  )
}

