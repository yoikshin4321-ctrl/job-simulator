import Link from 'next/link'

const linkClass = 'text-sm text-slate-600 hover:text-indigo-600 transition-colors block py-0.5'

export default function Footer() {
  return (
    <footer className="w-full bg-slate-100 border-t border-slate-200/80 text-slate-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* 고객센터 */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">고객센터</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              운영 시간: 평일 10:00 ~ 18:30
              <br />
              (주말·공휴일 휴무)
            </p>
            <a
              href="mailto:support@jobsimulation.kr?subject=JOB-EX%201:1%20문의"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all shadow-sm"
            >
              1:1 문의하기
            </a>
          </div>

          {/* 서비스 */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">서비스</h3>
            <nav className="flex flex-col gap-1">
              <Link href="/about" className={linkClass}>
                회사소개
              </Link>
              <a href="#" className={linkClass}>
                인재 채용
              </a>
              <a href="#" className={linkClass}>
                공지사항
              </a>
              <a href="#" className={linkClass}>
                제휴 대학 인증
              </a>
            </nav>
          </div>

          {/* 파트너스 */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">파트너스</h3>
            <nav className="flex flex-col gap-1">
              <a href="#" className={linkClass}>
                기업 제휴 문의
              </a>
              <a href="#" className={linkClass}>
                교육 기관 제휴
              </a>
              <a href="#" className={linkClass}>
                콘텐츠 제휴
              </a>
            </nav>
          </div>

          {/* 앱 & 사업자 정보 */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white text-[10px] font-medium py-2.5 px-3 hover:bg-slate-800 transition-colors"
                aria-label="App Store에서 다운로드"
              >
                <span className="leading-tight text-left">
                  DOWNLOAD ON THE
                  <br />
                  <span className="text-xs font-semibold">App Store</span>
                </span>
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white text-[10px] font-medium py-2.5 px-3 hover:bg-slate-800 transition-colors"
                aria-label="Google Play에서 다운로드"
              >
                <span className="leading-tight text-left">
                  GET IT ON
                  <br />
                  <span className="text-xs font-semibold">Google Play</span>
                </span>
              </a>
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed space-y-0.5">
              <p>상호: JOB-EX Lab</p>
              <p>대표: 홍길동</p>
              <p>사업자등록번호: 000-00-00000</p>
              <p>주소: 서울특별시 강남구 테헤란로 000, 00층</p>
              <p>통신판매업 신고번호: 제 2024-서울강남-00000호</p>
              <p>
                이메일:{' '}
                <a href="mailto:support@jobsimulation.kr" className="hover:text-indigo-600">
                  support@jobsimulation.kr
                </a>
              </p>
              <p>개인정보보호책임자: 김커리어</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
          <p className="text-slate-500">© 2026 JOB-EX. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">
              이용약관
            </a>
            <a href="#" className="font-bold text-slate-900 hover:text-indigo-700 transition-colors">
              개인정보처리방침
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              청소년 보호정책
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
