const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self' https://*.netlify.app",
            `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.netlify.app`,
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.netlify.app",
            "font-src 'self' data: https://fonts.gstatic.com https://*.netlify.app",
            "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://generativelanguage.googleapis.com https://*.netlify.app https://*.googleusercontent.com",
            "connect-src 'self' https://generativelanguage.googleapis.com https://images.unsplash.com https://plus.unsplash.com https://*.netlify.app",
            "frame-src 'self' https://*.netlify.app",
          ].join('; '),
        },
      ],
    },
    {
      source: '/api/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'no-store' },
      ],
    },
  ],
};

export default nextConfig;
