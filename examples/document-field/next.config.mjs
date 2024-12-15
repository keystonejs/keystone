export default {
  experimental: {
    // Experimental ESM Externals
    // https://nextjs.org/docs/messages/import-esm-externals
    // required to fix build admin ui issues related to "react-day-picker" and "date-fn"
    esmExternals: 'loose',
    // without this, 'Error: Expected Upload to be a GraphQL nullable type.'
    serverComponentsExternalPackages: ['graphql'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}
