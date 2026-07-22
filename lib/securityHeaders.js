/**
 * Shared security response headers for Next.js (next.config + middleware).
 * Addresses common OWASP ZAP findings: CSP, clickjacking, MIME sniffing, X-Powered-By.
 */

const isDev = process.env.NODE_ENV === 'development';

/** CSP allowing first-party app + Google Analytics, GIS, Turnstile, Cloudinary, Firebase. */
function buildContentSecurityPolicy() {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://challenges.cloudflare.com',
    'https://accounts.google.com',
  ].join(' ');

  const csp = `
    default-src 'self';
    script-src ${scriptSrc};
    style-src 'self' 'unsafe-inline' https://accounts.google.com;
    img-src 'self' blob: data: https://res.cloudinary.com https://www.google-analytics.com https://www.googletagmanager.com https://*.googleusercontent.com;
    font-src 'self' data:;
    connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com https://region1.google-analytics.com https://challenges.cloudflare.com https://api.cloudinary.com https://res.cloudinary.com https://*.googleapis.com https://firebasestorage.googleapis.com https://*.firebaseio.com https://accounts.google.com;
    frame-src https://challenges.cloudflare.com https://accounts.google.com;
    worker-src 'self' blob:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `;

  return csp.replace(/\s{2,}/g, ' ').trim();
}

const SECURITY_HEADERS = [
  {
    key: 'Content-Security-Policy',
    value: buildContentSecurityPolicy(),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
];

module.exports = {
  buildContentSecurityPolicy,
  SECURITY_HEADERS,
};
