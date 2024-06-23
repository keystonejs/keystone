// you don't need this if you're building something outside of the Keystone repo
import withPreconstruct from '@preconstruct/next'
import redirects from './redirects.mjs'

export default withPreconstruct({
  env: {
    siteUrl: 'https://keystonejs.com',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // next attempts to use Typescript, but it's not using our configuration
    //   we check Typescript elsewhere
    ignoreBuildErrors: true,
  },
  redirects,
})
