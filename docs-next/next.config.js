const withPreconstruct = require('@preconstruct/next');
const withPlugins = require('next-compose-plugins');
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});

module.exports = withPlugins([
  withPreconstruct,
  [withMDX, { pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'] }],
  nextConfig => {
    nextConfig.typescript = {
      ...nextConfig.typescript,
      // we run TS elsewhere, Next runs against a different TS config which it insists on existing
      // this is easier than making this the local TS config correct
      // + type checking slows down vercel deploys
      ignoreBuildErrors: true,
    };
    return nextConfig;
  },
]);
