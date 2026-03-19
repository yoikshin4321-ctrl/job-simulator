import React from 'react'
import './globals.css'
import NavBar from './NavBar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#F8FAFC]">
        <NavBar />
        <main className="w-full">{children}</main>
      </body>
    </html>
  )
}

