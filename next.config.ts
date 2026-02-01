import type { NextConfig } from "next";
import withPWA from '@ducanh2912/next-pwa';

const nextConfig: NextConfig = {
  transpilePackages: ['@react-pdf/renderer'],
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
};

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
})(nextConfig);

