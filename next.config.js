/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/technical-specs',
        destination: '/specs',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
