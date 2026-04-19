const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'generativelanguage.googleapis.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
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
              "default-src 'self' http://localhost:* https://*.netlify.app",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://*.netlify.app",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com http://localhost:* https://*.netlify.app",
              "font-src 'self' data: https://fonts.gstatic.com http://localhost:* https://*.netlify.app",
              "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://generativelanguage.googleapis.com http://localhost:* https://*.netlify.app https://*.googleusercontent.com",
              "connect-src 'self' http://localhost:* https://generativelanguage.googleapis.com https://images.unsplash.com https://plus.unsplash.com https://*.netlify.app",
              "frame-src 'self' http://localhost:* https://*.netlify.app",
              "media-src 'self' http://localhost:* https://*.netlify.app https://player.vimeo.com https://*.vimeocdn.com",
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
    ];
  },
};

export default nextConfig;
