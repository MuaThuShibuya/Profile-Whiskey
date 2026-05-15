/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Allow Cloudinary + any external domains used for avatars/bots
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Add other external image hosts here if needed
    ],
    // Keep unoptimized true so existing <img> tags and non-configured hosts still work.
    // To enable full Next.js image optimization, remove this line and use <Image> from 'next/image'.
    unoptimized: true,
  },
}

export default nextConfig
