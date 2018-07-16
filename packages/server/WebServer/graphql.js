const express = require('express');
const bodyParser = require('body-parser');
const { apolloUploadExpress } = require('apollo-upload-server');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');

module.exports = function createGraphQLMiddleware(
  keystone,
  { apiPath, graphiqlPath }
) {
  const app = express();

  // add the Admin GraphQL API
  const schema = keystone.getAdminSchema();
  app.use(
    apiPath,
    bodyParser.json(),
    // TODO: Make configurable
    apolloUploadExpress({ maxFileSize: 200 * 1024 * 1024, maxFiles: 5 }),
    graphqlExpress({ schema })
  );
  if (graphiqlExpress) {
    app.use(graphiqlPath, graphiqlExpress({ endpointURL: apiPath }));
  }
  return app;
};
