/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false,
  images: {
    domains: ["lh3.googleusercontent.com", "avatars.githubusercontent.com"],
    unoptimized: false
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" }
        ]
      }
    ]
  }
}
module.exports = nextConfig
