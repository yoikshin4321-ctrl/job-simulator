/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: new URL('.', import.meta.url).pathname,
  // OneDrive 동기 폴더의 숨김 폴더(`.next`) 스캔/접근에서 `scandir` 에러가 날 수 있어
  // 로컬에서는 distDir을 분리합니다. (Vercel에서는 기본 `.next`가 필요합니다)
  distDir: process.env.VERCEL ? '.next' : 'next-dist',
  env: {
    VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY,
    // Vercel 빌드 시 클라이언트 번들에 확실히 주입되도록 명시 (NEXT_PUBLIC_* 기본 동작 보강)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  typescript: {
    ignoreBuildErrors: true, // 타입 에러가 있어도 빌드를 끝까지 진행
  },
  eslint: {
    ignoreDuringBuilds: true, // 린트 에러도 빌드 차단하지 않도록 유지
  },
}

export default nextConfig

