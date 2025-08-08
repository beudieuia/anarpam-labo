/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Resolve path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    return config;
  },
};

module.exports = nextConfig;