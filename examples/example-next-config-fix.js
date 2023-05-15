// eslint-disable-next-line import/no-extraneous-dependencies
const withPreconstruct = require('@preconstruct/next');

const config = withPreconstruct({
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    appDir: false,
  },
});

module.exports = config;
