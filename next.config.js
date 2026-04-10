/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});

const nextConfig = {
  output: 'standalone',
  // NOTE: outputFileTracingIncludes was removed. Blog posts are now loaded
  // from a build-time manifest (lib/posts-manifest.json) instead of filesystem.
  // See scripts/build-posts-manifest.js for ADR and history.
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Explicitly declare public env vars so Turbopack inlines them at build time.
  // Turbopack does not reliably replace process.env.NEXT_PUBLIC_* inside
  // useEffect callbacks — declaring here forces static substitution.
  env: {
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/technical-specs',
        destination: '/specs',
        permanent: true,
      },
    ];
  },
};

module.exports = withMDX(nextConfig);
