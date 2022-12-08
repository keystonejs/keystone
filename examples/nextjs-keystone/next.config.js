/* You don't need this if you are building something outside of the Keystone repo */
const withPreconstruct = require('@preconstruct/next');

const nextConfig = {
  /*
      next@13 automatically bundles server code for server components.
      This causes a problem for the prisma binary built by Keystone.
      We need to explicity ask Next.js to opt-out from bundling
      dependencies that use native Node.js APIs.

      More here: https://beta.nextjs.org/docs/api-reference/next.config.js#servercomponentsexternalpackages
    */
  webpack: config => {
    config.externals = [...(config.externals || []), '.prisma/client'];
    // Important: return the modified config
    return config;
  },
};

/*
    If you are running this example outside the Keystone repo
    you can export the next config directly
*/
// module.exports = nextConfig;

/* withPreconstruct() is a special export for the keystone monorepo */
module.exports = withPreconstruct(nextConfig);
