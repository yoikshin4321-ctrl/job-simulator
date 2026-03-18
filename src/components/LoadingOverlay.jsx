import React from 'react'

export default function LoadingOverlay({ open, message = '불러오는 중...' }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm sm:text-base font-semibold text-white">{message}</p>
      </div>
    </div>
  )
}

