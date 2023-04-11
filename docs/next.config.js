// you don't need this if you're building something outside of the Keystone repo
const withPreconstruct = require('@preconstruct/next');

module.exports = withPreconstruct({
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
  redirects: require('./redirects.js'),
});
