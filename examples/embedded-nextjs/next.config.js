const { withKeystone } = require('@keystone-6/core/next');

module.exports = withKeystone({
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
});
