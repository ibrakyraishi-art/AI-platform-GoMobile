/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Разрешаем билд даже если env переменные не заданы
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
