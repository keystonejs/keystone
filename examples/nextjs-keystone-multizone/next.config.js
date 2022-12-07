/* You don't need this if you are building something outside of the Keystone repo */
const withPreconstruct = require('@preconstruct/next');

/*
  In localhost, Admin UI is a separate Next.js app served by the Keystone server
  and we point to its URL.
  In Vercel deployments, we use multizone approach and merge both your Next.js app
  and the Keystone Next.js Admin UI into one app.
*/
const KEYSTONE_URL = process.env.KEYSTONE_URL || 'http://localhost:3000';

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
  /*
    Multizone config to route all /admin requests to the Next.js app built by Keystone
  */
  async rewrites() {
    /*
      Setup redirects for multizone next apps only in production builds.
      In local dev builds, Next.js app and Keystone app
      run on separate servers.
    */
    return {
      beforeFiles: [
        {
          source: '/admin',
          destination: `${KEYSTONE_URL}/admin`,
        },
        {
          source: '/admin/:admin*',
          destination: `${KEYSTONE_URL}/admin/:admin*`,
        },
      ],
    };
  },
};

/*
    If you are running this example outside the Keystone repo
    you can export the next config directly
*/
// module.exports = nextConfig;

/* withPreconstruct() is a special export for the keystone monorepo */
module.exports = withPreconstruct(nextConfig);
