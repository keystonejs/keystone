const isStaticExport = process.env.STATIC_EXPORT === 'true'

export default {
  env: {
    siteUrl: 'https://keystonejs.com',
  },
  // You don't need this if you're building something outside of the Keystone repo
  experimental: {
    externalDir: true,
  },
  typescript: {
    // next attempts to use Typescript, but it's not using our configuration
    //   we check Typescript elsewhere
    ignoreBuildErrors: true,
  },
  ...(isStaticExport && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  }),
}
