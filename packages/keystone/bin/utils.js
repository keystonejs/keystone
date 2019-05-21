const terminalLink = require('terminal-link');
const express = require('express');
const endent = require('endent');
const ciInfo = require('ci-info');
const chalk = require('chalk');
const path = require('path');

const { DEFAULT_CONNECT_TO, DEFAULT_ENTRY, DEFAULT_PORT } = require('../constants');

const ttyLink = (text, path, port) => {
  if (ciInfo.isCI) {
    return;
  }
  const url = `http://localhost:${port}${path}`;
  const link = terminalLink(url, url, { fallback: () => url });
  console.log(`🔗 ${chalk.green(text)}\t${link}`);
};

function getEntryFileFullPath(args, { exeName, _cwd }) {
  const entryFile = args['--entry'] ? args['--entry'] : DEFAULT_ENTRY;
  try {
    return Promise.resolve(require.resolve(path.resolve(_cwd, entryFile)));
  } catch (error) {
    return Promise.reject(
      new Error(endent`
        --entry=${entryFile} was passed to ${exeName}, but '${entryFile}' couldn't be found in ${process.cwd()}.
        Ensure you're running ${exeName} from within the root directory of the project.
      `)
    );
  }
}

function extractAppMeta(apps) {
  let adminPath;
  let graphiqlPath;
  let apiPath;

  apps.forEach(app => {
    switch (app.constructor.name) {
      case 'AdminUIApp': {
        adminPath = app.adminPath;
        break;
      }
      case 'GraphQLApp': {
        apiPath = app._apiPath;
        graphiqlPath = app._graphiqlPath;
        break;
      }
    }
  });

  return {
    adminPath,
    graphiqlPath,
    apiPath,
  };
}

async function executeDefaultServer(args, entryFile, distDir, spinner) {
  const port = args['--port'] ? args['--port'] : DEFAULT_PORT;
  const connectTo = args['--connect-to'] ? args['--connect-to'] : DEFAULT_CONNECT_TO;

  spinner.text = 'Initialising Keystone instance';

  // Allow the spinner time to flush its output to the console.
  await new Promise(resolve => setTimeout(resolve, 100));

  const { keystone, apps = [] } = require(path.resolve(entryFile));

  spinner.succeed('Initialised Keystone instance');
  spinner.start('Preparing Keystone server');

  const app = express();
  const dev = process.env.NODE_ENV !== 'production';

  const { middlewares } = await keystone.prepare({ apps, port, distDir, dev });

  await keystone.connect(connectTo);

  app.use(middlewares);

  return new Promise((resolve, reject) => {
    spinner.text = 'Starting Keystone server';
    const server = app.listen(port, error => {
      if (error) {
        return reject(error);
      }

      spinner.succeed(chalk.green.bold('Keystone server listening'));
      const { adminPath, graphiqlPath, apiPath } = extractAppMeta(apps);
      /* eslint-disable no-unused-expressions */
      adminPath && ttyLink('Keystone Admin UI:', adminPath, port);
      graphiqlPath && ttyLink('GraphQL Playground:', graphiqlPath, port);
      apiPath && ttyLink('GraphQL API:\t', apiPath, port);
      /* eslint-enable no-unused-expressions */

      return resolve({ port, server });
    });
  });
}

module.exports = {
  getEntryFileFullPath,
  executeDefaultServer,
};
