const GraphQLServer = require('@keystone-alpha/server-graphql');
const path = require('path');

const DEFAULT_PORT = 3000;
const DEFAULT_ENTRY = 'index.js';
const DEFAULT_SERVER = 'server.js';
const DEFAULT_DIST_DIR = 'dist';

module.exports = {
  DEFAULT_PORT,
  DEFAULT_ENTRY,
  DEFAULT_SERVER,
  DEFAULT_DIST_DIR,
  prepare: async ({
    port = DEFAULT_PORT,
    entryFile = DEFAULT_ENTRY,
    dev = false,
    distDir,
    _cwd = process.cwd(),
  } = {}) => {
    const appEntry = require(path.resolve(_cwd, entryFile));

    if (!appEntry.keystone) {
      throw new Error(`No 'keystone' export found in ${entryFile}`);
    }

    const servers = appEntry.servers || [];

    // Inject graphQL server if the user hasn't specified it
    if (!servers.find(server => server.constructor === GraphQLServer)) {
      servers.unshift(new GraphQLServer());
    }

    const middlewares = await Promise.all(
      [
        // Inject any field middlewares (eg; WYSIWIG's static assets)
        // We do this first to avoid it conflicting with any catch-all routes the
        // user may have specified
        ...appEntry.keystone.registeredTypes,
        ...appEntry.servers,
      ]
        .filter(({ prepareMiddleware }) => !!prepareMiddleware)
        .map(server =>
          server.prepareMiddleware({
            keystone: appEntry.keystone,
            port,
            dev,
            distDir: distDir || appEntry.distDir || DEFAULT_DIST_DIR,
          })
        )
    );

    return { middlewares, keystone: appEntry.keystone };
  },
};
