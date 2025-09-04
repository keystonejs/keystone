export const nextConfigTemplate = (ts: boolean = true) =>
  `${ts ? `import type { NextConfig } from 'next'` : ''}

const nextConfig${ts ? `: NextConfig` : ''} = {
  // experimental: {
  //   // Experimental ESM Externals
  //   // https://nextjs.org/docs/messages/import-esm-externals
  //   // required to fix build admin ui issues related to "react-day-picker" and "date-fn"
  //   esmExternals: 'loose',
  //   // without this, 'Error: Expected Upload to be a GraphQL nullable type.'
  //   },
  // serverExternalPackages: ['graphql'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}
export default nextConfig
`
