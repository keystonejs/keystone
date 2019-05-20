const express = require('express');
const { renderPlaygroundPage } = require('graphql-playground-html');
const playgroundPkg = require('graphql-playground-react/package.json');
const chalk = require('chalk');
const falsey = require('falsey');
const terminalLink = require('terminal-link');
const { restrictAudienceMiddleware } = require('@keystone-alpha/session');

const { addDevQueryMiddlewares } = require('./devQuery');

const graphiqlMiddleware = endpoint => (req, res) => {
  const tab = { endpoint };
  if (req.query && req.query.query) {
    tab.query = req.query.query;
    tab.variables = req.query.variables;
  }

  res.setHeader('Content-Type', 'text/html');
  res.write(renderPlaygroundPage({ endpoint, version: playgroundPkg.version, tabs: [tab] }));
  res.end();
};

const ttyLink = (text, path, port, version) => {
  if (process.env.NODE_ENV !== 'production') {
    const url = `http://localhost:${port}${path}`;
    const prettyUrl = chalk.blue(url);
    const link = terminalLink(prettyUrl, url, { fallback: () => prettyUrl });
    const versionString = version ? ` (v${version})` : '';
    console.log(`🔗 ${chalk.green(text)} ${link}${versionString}`);
  }
};

module.exports = function createGraphQLMiddleware(
  server,
  { apiPath, graphiqlPath, port },
  { isPublic, audiences }
) {
  const app = express();
  const restrict = restrictAudienceMiddleware({ isPublic, audiences });

  if (graphiqlPath) {
    if (process.env.NODE_ENV !== 'production') {
      const devQueryPath = `${graphiqlPath}/go`;
      ttyLink('GraphQL Debug Links:', devQueryPath, port);

      if (falsey(process.env.DISABLE_LOGGING)) {
        // NOTE: Must come before we setup the API below
        app.use(devQueryPath, restrict);
        addDevQueryMiddlewares(app, apiPath, graphiqlPath, devQueryPath);
      }
    }

    ttyLink('GraphQL Playground:', graphiqlPath, port, playgroundPkg.version);
    app.get(graphiqlPath, [restrict, graphiqlMiddleware(apiPath)]);
  }

  ttyLink('GraphQL API:', apiPath, port);
  // { cors: false } - prevent ApolloServer from overriding Keystone's CORS configuration.
  // https://www.apollographql.com/docs/apollo-server/api/apollo-server.html#ApolloServer-applyMiddleware
  app.use(apiPath, restrict);
  server.applyMiddleware({ app, path: apiPath, cors: false });

  return app;
};
