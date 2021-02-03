const withPreconstruct = require('@preconstruct/next');
const withPlugins = require('next-compose-plugins');
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});

module.exports = withPlugins([
  withPreconstruct,
  [withMDX, { pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'] }],
]);
