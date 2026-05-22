import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // mock 단계 picsum.photos. 추후 백엔드 이미지 호스팅 도메인 추가 필요.
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
    ],
  },
};

export default nextConfig;
