export default {
  serverExternalPackages: ['graphql'],
  // You don't need this if you're building something outside of the Keystone repo
  experimental: {
    externalDir: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}
