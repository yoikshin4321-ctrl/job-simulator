'use client'

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const AUTH_KEY = 'job_sim_auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (parsed?.currentUser) {
        navigate('/', { replace: true })
      }
    } catch {
      // ignore parse error
    }
  }, [navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) {
      setError('가입된 계정을 먼저 생성해 주세요.')
      return
    }

    try {
      const parsed = JSON.parse(raw)
      const users = parsed?.users || []
      const found = users.find((u) => u.email === email.trim())
      if (!found || found.password !== password) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
        return
      }

      const next = {
        ...parsed,
        currentUser: { email: found.email, name: found.name },
      }
      localStorage.setItem(AUTH_KEY, JSON.stringify(next))
      navigate('/', { replace: true })
    } catch {
      setError('로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-2">로그인</h1>
        <p className="text-sm text-slate-500 mb-6">
          직무 시뮬레이션 결과와 리포트를 안전하게 저장하려면 로그인해 주세요.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="6자 이상 입력"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 rounded-2xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            로그인
          </button>
        </form>
        <p className="mt-4 text-xs text-slate-500 text-center">
          아직 계정이 없다면{' '}
          <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
            회원가입
          </Link>
          을 먼저 진행해 주세요.
        </p>
      </div>
    </div>
  )
}

