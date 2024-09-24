/** @type {import('next').NextConfig} */
const nextConfig = {
  // images: {
  //   domains: ["localhost:3000", "firebasestorage.googleapis.com", "picsum.photos"],
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
