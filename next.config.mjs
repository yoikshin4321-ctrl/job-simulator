/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: new URL('.', import.meta.url).pathname,
  // OneDrive가 숨김 폴더(`.next`)를 스캔/동기화하는 과정에서 scandir 에러가 날 수 있어,
  // dist 산출물을 프로젝트 안의 다른 폴더로 분리합니다. (node_modules는 여전히 프로젝트 안에 있으므로 모듈 해석 문제는 피함)
  distDir: 'next-dist',
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

