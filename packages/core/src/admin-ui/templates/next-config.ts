export const nextConfigTemplate = (basePath?: string) =>
  `const nextConfig = {
    // Experimental ESM Externals
    // https://nextjs.org/docs/messages/import-esm-externals
    // required to fix build admin ui issues related to "react-day-picker" and "date-fn"
    experimental: { esmExternals: 'loose' },
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
