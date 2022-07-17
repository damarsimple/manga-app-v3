/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'cdn.gudangkomik.com',
      'cdn1.gudangkomik.com',
      'cdn2.gudangkomik.com',
      'cdn3.gudangkomik.com',
    ],
  }
}

module.exports = nextConfig
