/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/AI-news',
  trailingSlash: true,
  images: { unoptimized: true },
}

module.exports = nextConfig
