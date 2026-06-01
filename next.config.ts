import type { NextConfig } from 'next';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

const nextConfig: NextConfig = {
  images: {
    // mock 단계 picsum.photos. 추후 백엔드 이미지 호스팅 도메인 추가 필요.
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
    ],
  },
  // AI API 프록시: 브라우저 → Next.js(동일 오리진) → Spring 백엔드 (CORS 회피)
  async rewrites() {
    return [
      {
        source: '/api/ai/:path*',
        destination: `${API_BASE_URL}/api/ai/:path*`,
      },
    ];
  },
};

export default nextConfig;

