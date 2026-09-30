/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        http: false,
        https: false,
        crypto: false,
      };
    }
    return config;
  },
  transpilePackages: ['@designforge/core', '@designforge/ai-adapter', '@designforge/mcp-server', '@designforge/browser-agent'],
};

module.exports = nextConfig;
