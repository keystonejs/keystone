const terminalLink = require('terminal-link');
const ciInfo = require('ci-info');
const chalk = require('chalk');

const ttyLink = (text, path, port) => {
  if (ciInfo.isCI) {
    return;
  }
  const url = `http://localhost:${port}${path}`;
  const link = terminalLink(url, url, { fallback: () => url });
  console.log(`🔗 ${chalk.green(text)}\t${link}`);
};

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

function logAdminRoutes(apps, port) {
  const { adminPath, graphiqlPath, apiPath } = extractAppMeta(apps);
  /* eslint-disable no-unused-expressions */
  adminPath && ttyLink('Keystone Admin UI:', adminPath, port);
  graphiqlPath && ttyLink('GraphQL Playground:', graphiqlPath, port);
  apiPath && ttyLink('GraphQL API:\t', apiPath, port);
  /* eslint-enable no-unused-expressions */
}

module.exports = {
  logAdminRoutes,
};
