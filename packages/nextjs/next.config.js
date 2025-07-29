// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "buidlguidl.com",
        pathname: "/assets/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  transpilePackages: ["@coinbase/onchainkit"],
  experimental: {
    // Removed optimizePackageImports to avoid conflicts
    // esmExternals: "loose", // Removed to avoid Railway cache issues
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Improve caching for Railway environment
    if (!dev) {
      config.cache = {
        type: 'filesystem',
        allowCollectingMemory: true,
        maxMemoryGenerations: 1,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
