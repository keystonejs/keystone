const express = require('express');
const bodyParser = require('body-parser');
const fastMemoize = require('fast-memoize');
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
      // memoizing to avoid requests that hit the same type multiple times.
      // We do it within the request callback so we can resolve it based on the
      // request info ( like who's logged in right now, etc)
      const getListAccessControlForUser = fastMemoize((listKey, operation) => {
        return keystone.getListAccessControl({
          listKey,
          operation,
          authentication: { item: req.user, listKey: req.authedListKey },
        });
      });

      const getFieldAccessControlForUser = fastMemoize(
        (listKey, fieldKey, item, operation) => {
          return keystone.getFieldAccessControl({
            item,
            listKey,
            fieldKey,
            operation,
            authentication: { item: req.user, listKey: req.authedListKey },
          });
        }
      );

      return {
        schema,
        // Will come from the session middleware above
        context: {
          authedItem: req.user,
          authedListKey: req.authedListKey,
          getListAccessControlForUser,
          getFieldAccessControlForUser,
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
