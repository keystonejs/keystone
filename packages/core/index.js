const { WebServer } = require('@keystone-alpha/server');
const pick = require('lodash.pick');
const path = require('path');

const DEFAULT_PORT = 3000;
const DEFAULT_ENTRY = 'index.js';
const DEFAULT_SERVER = 'server.js';
const DEFAULT_DIST_DIR = 'dist';

const defaultServerConfig = {
  apiPath: '/admin/api',
  graphiqlPath: '/admin/graphiql',
  apollo: undefined,
  cors: { origin: true, credentials: true },
  cookieSecret: 'qwerty',
};

function cleanServerConfig(config) {
  return pick(
    {
      ...defaultServerConfig,
      ...config,
    },
    ['cookieSecret', 'sessionStore', 'pinoOptions', 'cors', 'apiPath', 'graphiqlPath', 'apollo']
  );
}

function prepareConfig({ entryFile, _cwd = process.cwd() }) {
  // NOTE: Will throw if file not found. We purposely let that error surface.
  const appEntry = require(path.resolve(_cwd, entryFile));

  if (!appEntry.keystone) {
    throw new Error(`No 'keystone' export found in ${entryFile}`);
  }

  if (appEntry.serverConfig && typeof appEntry.serverConfig !== 'object') {
    throw new Error(
      `'serverConfig' must be an object. Check ${
        appEntry.serverConfig ? entryFile : 'your custom server'
      }.`
    );
  }

  return {
    appEntry,
    cleanedServerConfig: cleanServerConfig(appEntry.serverConfig || {}),
  };
}

function prepare({
  port = DEFAULT_PORT,
  entryFile = DEFAULT_ENTRY,
  distDir,
  _cwd = process.cwd(),
} = {}) {
  // NOTE: As it stands today, this is not an async task. However, we
  // purposely return a promise here to give us future flexibility with making
  // it an async task without any client code having to be modified.
  return new Promise(resolve => {
    // NOTE: This is within the promise so if it throws, we return a rejected
    // promise from the function rather than a thrown error (don't release the
    // Zalgo!)
    const { cleanedServerConfig, appEntry } = prepareConfig({ entryFile, _cwd });

    const server = new WebServer(appEntry.keystone, {
      // Set all the other options
      ...cleanedServerConfig,
      // Force the admin & port
      ...(appEntry.admin && { adminUI: appEntry.admin }),
      distDir,
      port,
    });

    return resolve({ server, keystone: appEntry.keystone });
  });
}

module.exports = {
  DEFAULT_PORT,
  DEFAULT_ENTRY,
  DEFAULT_SERVER,
  DEFAULT_DIST_DIR,
  prepareConfig,
  prepare,
};
