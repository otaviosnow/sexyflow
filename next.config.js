/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'sexyflow.com'],
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/subdomain/:path*',
        destination: '/api/pages/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
