/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
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
    ];
  },
};

module.exports = withMDX(nextConfig);
