// you don't need this if you're building something outside of the Keystone repo
import withPreconstruct from '@preconstruct/next'

export default withPreconstruct({
  serverExternalPackages: ['graphql'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
})
