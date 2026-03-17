import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

const AUTH_KEY = 'job_sim_auth'

export default function NavBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const linkClass = (path) =>
    `px-4 py-2 text-sm font-medium transition-colors rounded-xl ${
      isActive(path)
        ? 'text-indigo-600 bg-indigo-50'
        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
    }`

  useEffect(() => {
    const readAuth = () => {
      try {
        const raw = localStorage.getItem(AUTH_KEY)
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

    const onStorage = (e) => {
      if (e.key === AUTH_KEY) {
        readAuth()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const handleLogout = () => {
    try {
      const raw = localStorage.getItem(AUTH_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        const next = { ...(parsed || {}), currentUser: null }
        localStorage.setItem(AUTH_KEY, JSON.stringify(next))
      }
    } catch {
      // ignore
    }
    setCurrentUser(null)
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-sm w-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* 좌측 그룹: 로고 + 내비게이션 */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <Link
            to="/"
            className="text-lg font-bold text-indigo-600 hover:text-indigo-700 transition-colors tracking-tight flex-shrink-0"
          >
            Job Simulation
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/explore" className={linkClass('/explore')}>
              직업 탐색
            </Link>
            <Link to="/simulation" className={linkClass('/simulation')}>
              시뮬레이션
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
                to="/login"
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                로그인
              </Link>
              <Link
                to="/signup"
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
