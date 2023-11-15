export const nextConfigTemplate = (basePath?: string) =>
  `const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    // We use transpilePackages for the custom admin-ui pages in the ./admin folder
    // as they import ts files into nextjs
    transpilePackages: ['../../admin'],
    ${basePath ? `basePath: '${basePath}',` : ''} 
  }
  
  module.exports = nextConfig`
