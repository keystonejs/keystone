const express = require('express');
const bodyParser = require('body-parser');
const { apolloUploadExpress } = require('apollo-upload-server');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const {
  formatError,
  isInstance: isApolloErrorInstance,
} = require('apollo-errors');
const cuid = require('cuid');
const logger = require('@keystonejs/logger');

const graphqlLogger = logger('graphql');

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
    graphqlExpress(req => {
      return {
        schema,
        // Will come from the session middleware above
        context: {
          authedItem: req.user,
          authedListKey: req.authedListKey,
        },
        formatError: error => {
          // For correlating user error reports with logs
          error.uid = cuid();
          const { originalError } = error;
          if (isApolloErrorInstance(originalError)) {
            // log internalData to stdout but not include it in the formattedError
            // TODO: User pino for logging
            graphqlLogger.info({
              type: 'error',
              data: originalError.data,
              internalData: originalError.internalData,
            });
          } else {
            graphqlLogger.error(error);
          }
          const formattedError = formatError(error);

          if (error.uid) {
            formattedError.uid = error.uid;
          }

          return formattedError;
        },
      };
    })
  );
  if (graphiqlPath) {
    app.use(graphiqlPath, graphiqlExpress({ endpointURL: apiPath }));
  }
  return app;
};
