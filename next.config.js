/** @type {import('next').NextConfig} */
const nextConfig = {
  
  async headers() {
    return [
      {
        // Apply CORS headers to API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['xlsx', 'file-saver', 'jszip'],
  },
  
  // Configure webpack for better handling of worker files and Vercel
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    
    // Optimize for serverless functions
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    }
    
    return config;
  },
  
  // Image optimization settings
  images: {
    domains: ['drive.google.com', 'docs.google.com'],
    unoptimized: true, // For better compatibility with static exports
  },
  
  // Remove API configuration to avoid conflicts with Vercel
};

module.exports = nextConfig;
