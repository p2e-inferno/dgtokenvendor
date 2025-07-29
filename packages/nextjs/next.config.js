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
    optimizePackageImports: ["@coinbase/onchainkit"],
    esmExternals: "loose",
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // For onchainkit CSS handling
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.onchainkit = {
        name: 'onchainkit',
        test: /[\\/]node_modules[\\/]@coinbase[\\/]onchainkit[\\/]/,
        chunks: 'all',
        priority: 10,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
