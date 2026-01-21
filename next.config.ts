import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'one-api.rapidoochoa.com.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.rapidoochoa.com.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.rapidoochoa.com.co',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
