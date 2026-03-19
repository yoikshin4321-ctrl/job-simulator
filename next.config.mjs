/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: new URL('.', import.meta.url).pathname,
  env: {
    VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY,
  },
  typescript: {
    ignoreBuildErrors: true, // 타입 에러가 있어도 빌드를 끝까지 진행
  },
  eslint: {
    ignoreDuringBuilds: true, // 린트 에러도 빌드 차단하지 않도록 유지
  },
}

export default nextConfig

