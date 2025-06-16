import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  devtool: process.env.NODE_ENV === 'development' ? 'eval-source-map' : false,
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
