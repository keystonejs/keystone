// you don't need this if you're building something outside of the Keystone repo
import withPreconstruct from '@preconstruct/next'

export default withPreconstruct({
  experimental: {
    // without this, 'Error: Expected Upload to be a GraphQL nullable type.'
    serverComponentsExternalPackages: ['graphql'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
})
