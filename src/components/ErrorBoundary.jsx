import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <p className="text-slate-700 font-semibold mb-2">일시적인 오류가 발생했습니다.</p>
            <p className="text-xs text-slate-500 mb-4">
              잠시 후 다시 시도해 주세요. 문제가 계속된다면 새로고침 후 다시 접속해 주세요.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

