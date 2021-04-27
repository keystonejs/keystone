const withPreconstruct = require('@preconstruct/next');
const withPlugins = require('next-compose-plugins');
const withImages = require('next-images');
const mdxHints = require('remark-hint');
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [mdxHints],
  },
});

const redirects = {
  async redirects() {
    // if this array becomes bigger than 3 entries, please make it a separate file
    return [
      {
        source: '/faqs',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = withPlugins([
  withPreconstruct,
  withImages,
  [withMDX, { pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'] }],
  nextConfig => {
    nextConfig.env = {
      siteUrl: 'https://next.keystonejs.com',
    };
    nextConfig.typescript = {
      ...nextConfig.typescript,
      // we run TS elsewhere, Next runs against a different TS config which it insists on existing
      // this is easier than making this the local TS config correct
      // + type checking slows down vercel deploys
      ignoreBuildErrors: true,
    };
    return nextConfig;
  },
  redirects,
]);
