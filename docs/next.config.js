const withPreconstruct = require('@preconstruct/next');
const withPlugins = require('next-compose-plugins');
const mdxHints = require('remark-hint');
const gfm = require('remark-gfm');

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    providerImportSource: '@mdx-js/react',
    remarkPlugins: [mdxHints, gfm],
  },
});

const redirectRoutes = require('./redirects.js');
const redirects = {
  async redirects() {
    return redirectRoutes;
  },
};

module.exports = withPlugins([
  withPreconstruct,
  [
    withMDX,
    {
      pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    },
  ],
  nextConfig => {
    nextConfig.env = {
      siteUrl: 'https://keystonejs.com',
    };
    nextConfig.eslint = { ignoreDuringBuilds: true };
    nextConfig.typescript = {
      ...nextConfig.typescript,
      // we run TS elsewhere, Next runs against a different TS config which it insists on existing
      // this is easier than making this the local TS config correct
      // + type checking slows down vercel deploys
      ignoreBuildErrors: true,
    };
    const webpack = nextConfig.webpack;
    nextConfig.webpack = (_config, args) => {
      const config = webpack ? webpack(_config, args) : _config;
      const { isServer } = args;
      if (!isServer) {
        config.resolve.fallback.fs = false;
      }
      return config;
    };
    return nextConfig;
  },
  redirects,
]);
