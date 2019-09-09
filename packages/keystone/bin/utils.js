const terminalLink = require('terminal-link');
const express = require('express');
const endent = require('endent');
const ciInfo = require('ci-info');
const chalk = require('chalk');
const path = require('path');

const { DEFAULT_ENTRY, DEFAULT_PORT } = require('../constants');

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
  let router;
  let status = 'start-server';

  spinner.text = 'Starting Keystone server';
  const app = express();

  app.use((req, res, next) => {
    if (router) {
      return router(req, res, next);
    } else {
      res.format({
        default: () => res.sendFile(path.resolve(__dirname, './loading.html')),
        'text/html': () => res.sendFile(path.resolve(__dirname, './loading.html')),
        'application/json': () => res.json({ loading: true, status }),
      });
    }
  });

  const { server } = await new Promise((resolve, reject) => {
    const server = app.listen(port, error => {
      if (error) {
        return reject(error);
      }
      return resolve({ server });
    });
  });

  spinner.succeed(`Keystone server listening on port ${port}`);
  spinner.text = 'Initialising Keystone instance';

  status = 'init-keystone';

  // Allow the spinner time to flush its output to the console.
  await new Promise(resolve => setTimeout(resolve, 100));

  const { keystone, apps = [] } = require(path.resolve(entryFile));

  spinner.succeed('Initialised Keystone instance');
  spinner.start('Connecting to database');

  status = 'db-connect';

  const dev = process.env.NODE_ENV !== 'production';

  const { middlewares } = await keystone.prepare({ apps, distDir, dev });

  await keystone.connect();

  spinner.succeed('Connected to database');
  spinner.start('Preparing to accept requests');

  router = express.Router();
  router.use(middlewares);

  spinner.succeed(chalk.green.bold('Keystone instance is ready 🚀'));

  const { adminPath, graphiqlPath, apiPath } = extractAppMeta(apps);

  /* eslint-disable no-unused-expressions */
  adminPath && ttyLink('Keystone Admin UI:', adminPath, port);
  graphiqlPath && ttyLink('GraphQL Playground:', graphiqlPath, port);
  apiPath && ttyLink('GraphQL API:\t', apiPath, port);
  /* eslint-enable no-unused-expressions */

  return { port, server };
}

module.exports = {
  getEntryFileFullPath,
  executeDefaultServer,
};
