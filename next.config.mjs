/** @type {import('next').NextConfig} */
const nextConfig = {
  // 支持 SQLite 数据库
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 在服务端构建时包含 SQLite 相关文件
      config.externals.push({
        'better-sqlite3': 'commonjs better-sqlite3'
      });
    }
    return config;
  },
  
  // 确保静态文件包含数据库
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./data/**/*', './database/**/*'],
    },
  },
  
  // 输出配置
  output: 'standalone',
  
  // 静态资源配置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300' },
        ],
      },
    ];
  },
};

export default nextConfig;