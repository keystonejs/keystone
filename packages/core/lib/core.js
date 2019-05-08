const { WebServer } = require('@keystone-alpha/server');
const endent = require('endent');
const pick = require('lodash.pick');
const path = require('path');

const DEFAULT_PORT = 3000;
const DEFAULT_ENTRY = 'index.js';
const DEFAULT_SERVER = 'server.js';

function cleanServerConfig(config) {
  return pick(config, [
    'cookieSecret',
    'sessionStore',
    'pinoOptions',
    'cors',
    'apiPath',
    'graphiqlPath',
    'apollo',
  ]);
}

module.exports = {
  DEFAULT_PORT,
  DEFAULT_ENTRY,
  DEFAULT_SERVER,
  prepare: ({
    port = DEFAULT_PORT,
    entryFile = DEFAULT_ENTRY,
    serverConfig,
    distDir,
    _cwd = process.cwd(),
  } = {}) =>
    new Promise((resolve, reject) => {
      let appEntry;
      try {
        appEntry = require(path.resolve(_cwd, entryFile));
      } catch (error) {
        return reject(error);
      }

      if (!appEntry.keystone) {
        return reject(new Error(`No 'keystone' export found in ${entryFile}`));
      }

      // Enforce moving server config closer to where the server is... configured,
      // when using a custom server with keystone
      if (appEntry.serverConfig && serverConfig) {
        return reject(
          new Error(endent`
            Ambiguous 'serverConfig' detected.
            When using a custom server, you should move 'serverConfig' from your index.js export to your 'server.js' file:
            > keystone.prepre({ serverConfig: { ... } })
          `)
        );
      }

      const resolvedConfig = appEntry.serverConfig || serverConfig;

      if (resolvedConfig && typeof resolvedConfig !== 'object') {
        return reject(
          new Error(
            `'serverConfig' must be an object. Check ${
              appEntry.serverConfig ? entryFile : 'your custom server'
            }.`
          )
        );
      }

      const cleanedServerConfig = cleanServerConfig(resolvedConfig || {});

      const server = new WebServer(appEntry.keystone, {
        // Set all the other options
        ...cleanedServerConfig,
        // Force the admin & port
        ...(appEntry.admin ? { adminUI: appEntry.admin } : {}),
        port,
        distDir: distDir || appEntry.distDir || 'dist',
      });

      return resolve({ server, keystone: appEntry.keystone });
    }),
};
