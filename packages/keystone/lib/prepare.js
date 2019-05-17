const GraphQLApp = require('@keystone-alpha/app-graphql');
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

  const apps = appEntry.apps || [];

  // Inject graphQL app if the user hasn't specified it
  if (!apps.find(app => app.constructor.name === GraphQLApp.name)) {
    apps.unshift(new GraphQLApp());
  }

  const middlewares = flattenDeep(
    await Promise.all(
      [
        // Inject any field middlewares (eg; WYSIWIG's static assets)
        // We do this first to avoid it conflicting with any catch-all routes the
        // user may have specified
        ...(appEntry.keystone.registeredTypes || []),
        ...apps,
      ]
        .filter(({ prepareMiddleware } = {}) => !!prepareMiddleware)
        .map(app =>
          app.prepareMiddleware({
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
