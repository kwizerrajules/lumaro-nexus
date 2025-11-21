/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    serverComponentsExternalPackages: ['jsdom', 'parse5'],
  },
};

module.exports = nextConfig;