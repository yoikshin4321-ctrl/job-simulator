/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: new URL('.', import.meta.url).pathname,
  // OneDrive 동기화 폴더 안의 `.next`는 scandir UNKNOWN(-4094)로 자주 깨짐 → 같은 프로젝트 안 `next-cache` 사용
  // (프로젝트 밖 절대 경로는 Next가 join 처리할 때 모듈 해석이 깨지므로 쓰지 않음)
  distDir: 'next-cache',
  env: {
    VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
