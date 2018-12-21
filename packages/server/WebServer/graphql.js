const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { formatError, isInstance: isApolloErrorInstance } = require('apollo-errors');
const { renderPlaygroundPage } = require('graphql-playground-html');
const cuid = require('cuid');
const logger = require('@voussoir/logger');
const { omit } = require('@voussoir/utils');
const { graphql } = require('graphql');

const { NestedError } = require('./graphqlErrors');

const graphqlLogger = logger('graphql');

module.exports = function createGraphQLMiddleware(keystone, { apiPath, graphiqlPath }) {
  const app = express();

  // add the Admin GraphQL API
  const server = new ApolloServer({
    ...keystone.getAdminSchema(),
    maxFileSize: 200 * 1024 * 1024, // TODO: Make configurable
    maxFiles: 5,
    context: ({ req }) => keystone.getAccessContext(req),
    formatError: error => {
      try {
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
          if (error.extensions && error.extensions.exception) {
            const pinoError = {
              message: error.message || error.msg,
              ...omit(error.extensions.exception, ['name', 'model']),
              path: error.path,
              stack: Array.isArray(error.extensions.exception.stacktrace)
                ? error.extensions.exception.stacktrace.join('\n')
                : error.extensions.exception.stacktrace,
            };

            if (error.extensions.exception.path) {
              pinoError.path = Array.isArray(pinoError.path)
                ? [...pinoError.path, error.extensions.exception.path]
                : [error.extensions.exception.path];
            }
            graphqlLogger.error(pinoError);
          } else {
            graphqlLogger.error(error);
          }
        }

        let formattedError;

        // Support throwing multiple errors
        if (originalError && originalError.errors) {
          const multipleErrorContainer = new NestedError({
            data: {
              errors: originalError.errors.map(innerError => {
                // Ensure the path is complete
                if (Array.isArray(error.path) && Array.isArray(innerError.path)) {
                  innerError.path = [...error.path, ...innerError.path];
                }

                // Format (aka; serialize) the error
                return formatError(innerError);
              }),
            },
          });

          formattedError = formatError(multipleErrorContainer);
        } else {
          formattedError = formatError(error);
        }

        if (error.uid) {
          formattedError.uid = error.uid;
        }

        return formattedError;
      } catch (formatErrorError) {
        // Something went wrong with formatting above, so we log the errors
        graphqlLogger.error(error);
        graphqlLogger.error(formatErrorError);

        // Then return the original error as a fallback so the client gets at
        // least some useful info
        return formatError(error);
      }
    },
  });

  server.applyMiddleware({
    app,
    path: apiPath,
    // Prevent ApolloServer from overriding Keystone's CORS configuration.
    // https://www.apollographql.com/docs/apollo-server/api/apollo-server.html#ApolloServer-applyMiddleware
    cors: false,
  });

  if (graphiqlPath) {
    app.use(graphiqlPath, (req, res) => {
      if (req.user && req.sessionID) {
        // This is a literal string which is injected into the HTML string and
        // used as part of a JSON object...
        res.setHeader('Authorization', `Bearer ${req.sessionID}`);
      }
      res.setHeader('Content-Type', 'text/html');
      res.write(renderPlaygroundPage({ endpoint: apiPath, version: '1.6.0' }));
      res.end();
    });
  }

  keystone.registerGraphQLQueryMethod((query, context, variables) =>
    graphql(server.schema, query, null, context, variables)
  );

  return app;
};
