import React from 'react'
import './globals.css'
import NavBar from './NavBar'
import Footer from './Footer'

export const dynamic = 'force-dynamic'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <NavBar />
        <main className="w-full flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

