import { Link, useLocation } from 'react-router-dom'

export default function NavBar() {
  const location = useLocation()

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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-sm w-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex items-center justify-between h-16">
        <Link
          to="/"
          className="text-lg font-bold text-indigo-600 hover:text-indigo-700 transition-colors tracking-tight"
        >
          Job Simulation
        </Link>
        <nav className="flex items-center gap-1">
          <Link to="/explore" className={linkClass('/explore')}>
            직업 탐색
          </Link>
          <Link to="/simulation" className={linkClass('/simulation')}>
            Simulation
          </Link>
        </nav>
      </div>
    </header>
  )
}
