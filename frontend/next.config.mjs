/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Standalone mode is only needed for Docker container builds.
  // Standard builds (e.g. Vercel deployment) must NOT use standalone output as it causes Vercel 404 errors.
  ...(process.env.BUILD_STANDALONE === 'true' ? { output: 'standalone' } : {}),
};

export default nextConfig;

