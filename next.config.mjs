/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: new URL('.', import.meta.url).pathname,
  // 로컬(OneDrive): `next-cache` — `.next` scandir 오류 회피. Vercel은 반드시 `.next` (플랫폼이 그 경로를 읽음)
  distDir: process.env.VERCEL ? '.next' : 'next-cache',
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
