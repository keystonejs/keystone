const GraphQLServer = require('@keystone-alpha/server-graphql');
const flattenDeep = require('lodash.flattendeep');
const path = require('path');
const { DEFAULT_PORT, DEFAULT_ENTRY, DEFAULT_DIST_DIR } = require('../constants');

module.exports = async ({
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
  if (!servers.find(server => server.constructor.name === GraphQLServer.name)) {
    servers.unshift(new GraphQLServer());
  }

  const middlewares = flattenDeep(
    await Promise.all(
      [
        // Inject any field middlewares (eg; WYSIWIG's static assets)
        // We do this first to avoid it conflicting with any catch-all routes the
        // user may have specified
        ...(appEntry.keystone.registeredTypes || []),
        ...servers,
      ]
        .filter(({ prepareMiddleware } = {}) => !!prepareMiddleware)
        .map(server =>
          server.prepareMiddleware({
            keystone: appEntry.keystone,
            port,
            dev,
            distDir: distDir || appEntry.distDir || DEFAULT_DIST_DIR,
          })
        )
    )
  ).filter(middleware => !!middleware);

  return { middlewares, keystone: appEntry.keystone };
};
