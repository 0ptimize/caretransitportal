/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Auth redirects
      {
        source: '/login',
        destination: '/auth/signin',
        permanent: true,
      },
      // Portal redirects for unauthenticated users
      {
        source: '/admin',
        destination: '/auth/signin?callbackUrl=/admin',
        permanent: false,
      },
      {
        source: '/district',
        destination: '/auth/signin?callbackUrl=/district',
        permanent: false,
      },
      {
        source: '/employee',
        destination: '/auth/signin?callbackUrl=/employee',
        permanent: false,
      },
      // Handle trailing slashes
      {
        source: '/admin/',
        destination: '/admin',
        permanent: true,
      },
      {
        source: '/district/',
        destination: '/district',
        permanent: true,
      },
      {
        source: '/employee/',
        destination: '/employee',
        permanent: true,
      },
    ]
  },
  // Ensure we handle auth errors gracefully
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
