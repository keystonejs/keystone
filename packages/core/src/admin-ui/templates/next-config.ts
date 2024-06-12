export const nextConfigTemplate = (basePath?: string) =>
  `const fs = require('fs');
const path = require('path');
const { merge } = require('lodash');

// Base configuration for Next.js
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['../../admin'], // custom admin-ui pages
  ${basePath ? `basePath: '${basePath}',` : ""} 
};

// Path to the potential custom config file
const customConfigPath = path.join(__dirname, '..', '..', 'next.config.js');

// Check if the custom config file exists and merge it
try {
  if (fs.existsSync(customConfigPath)) {
    const customConfig = require(customConfigPath);
    merge(nextConfig, customConfig);
  }
} catch (error) {
  console.error('Failed to load or merge custom config:', error);
}

module.exports = nextConfig;
`;
