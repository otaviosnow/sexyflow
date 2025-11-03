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
  // Otimizações para reduzir erros de cache
  generateBuildId: async () => {
    // Usar hash baseado em timestamp para evitar conflitos
    return `build-${Date.now()}`;
  },
  // Headers para melhor gerenciamento de cache
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
