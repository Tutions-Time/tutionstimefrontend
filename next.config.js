/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    unoptimized: true, // keep if you don't want Next image optimization
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost', port: '5000', pathname: '/uploads/**' },
    ],
  },
};

module.exports = nextConfig;
