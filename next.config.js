const { SECURITY_HEADERS } = require('./lib/securityHeaders.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Stop advertising the stack via X-Powered-By (OWASP ZAP low finding)
  poweredByHeader: false,

  experimental: {
    serverComponentsExternalPackages: [
      'cloudinary',
      'jsdom',
      'parse5',
      'sharp',
    ],
    // Build-time integrity hashes on Next.js script tags (OWASP ZAP SRI finding)
    sri: {
      algorithm: 'sha384',
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  // Needed so browsers can apply SRI hashes from experimental.sri
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.output.crossOriginLoading = 'anonymous';
    }
    return config;
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

module.exports = nextConfig;
