import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true
  ,images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ]
  }
  ,allowedDevOrigins   : ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1"],
  reactStrictMode     : true,
};

export default nextConfig;
