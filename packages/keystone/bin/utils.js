const terminalLink = require('terminal-link');
const express = require('express');
const endent = require('endent').default;
const ciInfo = require('ci-info');
const chalk = require('chalk');
const path = require('path');

const { DEFAULT_ENTRY, DEFAULT_PORT, DEFAULT_APP_URL } = require('../constants');

const verifyTableMessages = verifyTableResults => {
  const verifyTableErrors = verifyTableResults.filter(({ isRejected }) => isRejected);

  verifyTableErrors.forEach(({ value, reason }) => {
    console.log('\n');
    console.warn(
      `Error verifying ${value && value.tableName ? value.tableName : 'table'}: ${reason}`
    );
  });
  if (verifyTableResults.every(({ value }) => !(value && value.hasTable))) {
    console.log('\n');
    console.warn(
      `Database is empty. Initialise tables with: '${chalk.green('npx keystone create-tables')}'`
    );
    console.warn(
      `See: 🔗 ${chalk.green('https://www.keystonejs.com/quick-start/#installing-keystone')}`
    );
    console.log('\n');
  } else if (verifyTableResults.some(({ value }) => !(value && value.hasTable))) {
    const notTables = verifyTableResults
      .filter(({ value }) => !value.hasTable)
      .map(({ value }) => value.tableName);

    console.log('\n');
    console.warn(
      `Your database has been initialised, but ${chalk.bold(
        'the following tables are missing'
      )}: ${notTables.join(', ')}`
    );
    console.warn(
      `You might need a migration: 🔗 ${chalk.green(
        'https://www.keystonejs.com/guides/migrations/#migrations-in-keystone'
      )}`
    );
    console.log('\n');
  }
};

const ttyLink = (text, path, appUrl) => {
  if (ciInfo.isCI) {
    return;
  }
  const url = `${appUrl}${path}`;
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

function extractAppMeta(apps, dev) {
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
        graphiqlPath = dev ? app._graphiqlPath : undefined;
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
  const appUrl = args['--app-url'] ? args['--app-url'] : DEFAULT_APP_URL;
  let status = 'start-server';

  spinner.text = 'Starting Keystone server';
  const app = express();

  app.use((req, res, next) => {
    if (status === 'started') {
      next();
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

  const {
    keystone,
    apps = [],
    configureExpress = () => {},
    cors,
    pinoOptions,
  } = require(path.resolve(entryFile));

  configureExpress(app);

  spinner.succeed('Initialised Keystone instance');

  status = 'db-connect';

  const dev = process.env.NODE_ENV !== 'production';

  const { middlewares } = await keystone.prepare({ apps, distDir, dev, cors, pinoOptions });

  spinner.start('Connecting to database');
  await keystone.connect();
  spinner.succeed('Connected to database');

  if (keystone.adapter && keystone.adapter.name === 'knex') {
    spinner.start('Verifying tables');
    const verifyTableResults = await keystone.adapter._verifyTables();
    verifyTableMessages(verifyTableResults);
    spinner.succeed('Verifying tables');
  }
  spinner.start('Preparing to accept requests');

  app.use(middlewares);
  status = 'started';
  spinner.succeed(chalk.green.bold(`Keystone instance is ready at http://localhost:${port} 🚀`));
  const { adminPath, graphiqlPath, apiPath } = extractAppMeta(apps, dev);

  /* eslint-disable no-unused-expressions */
  adminPath && ttyLink('Keystone Admin UI:', adminPath, appUrl);
  graphiqlPath && ttyLink('GraphQL Playground:', graphiqlPath, appUrl);
  apiPath && ttyLink('GraphQL API:\t', apiPath, appUrl);
  /* eslint-enable no-unused-expressions */

  return { port, server };
}

module.exports = {
  getEntryFileFullPath,
  executeDefaultServer,
};
