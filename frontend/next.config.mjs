/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Standalone output mode automatically traces all imports and bundles only necessary
  // node_modules into .next/standalone. This reduces Docker image size from ~1GB to ~150MB.
  output: 'standalone',
};

export default nextConfig;
