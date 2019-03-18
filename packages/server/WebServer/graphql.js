const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { formatError, isInstance: isApolloErrorInstance } = require('apollo-errors');
const { renderPlaygroundPage } = require('graphql-playground-html');
const playgroundPkg = require('graphql-playground-react/package.json');
const cuid = require('cuid');
const chalk = require('chalk');
const logger = require('@keystone-alpha/logger');
const falsey = require('falsey');
const { omit } = require('@keystone-alpha/utils');
const { graphql } = require('graphql');
const StackUtils = require('stack-utils');
const ensureError = require('ensure-error');
const terminalLink = require('terminal-link');
const serializeError = require('serialize-error');

const { NestedError } = require('./graphqlErrors');
const { addDevQueryMiddlewares } = require('./devQuery');

const graphqlLogger = logger('graphql');

const stackUtil = new StackUtils({ cwd: process.cwd(), internals: StackUtils.nodeInternals() });

const cleanError = maybeError => {
  if (!maybeError.stack) {
    return maybeError;
  }
  maybeError.stack = stackUtil.clean(maybeError.stack);
  return maybeError;
};

const safeFormatError = error => {
  const formattedError = formatError(error, true);
  if (formattedError) {
    return cleanError(formattedError);
  }
  return serializeError(cleanError(error));
};

const duplicateError = (error, ignoreKeys = []) => {
  const newError = new error.constructor(error.message);
  if (error.stack) {
    if (isApolloErrorInstance(error)) {
      newError._stack = error.stack;
    } else {
      newError.stack = error.stack;
    }
  }
  if (error.code) {
    newError.code = error.code;
  }
  return Object.assign(newError, omit(error, ignoreKeys));
};

const flattenNestedErrors = error =>
  (error.errors || []).reduce(
    (errors, nestedError) => [
      ...errors,
      ...[duplicateError(nestedError, ['errors']), ...flattenNestedErrors(nestedError)].map(
        flattenedError => {
          // Ensure the path is complete
          if (Array.isArray(error.path) && Array.isArray(flattenedError.path)) {
            flattenedError.path = [...error.path, ...flattenedError.path];
          }
          return flattenedError;
        }
      ),
    ],
    []
  );

const _formatError = error => {
  const { originalError } = error;
  if (originalError && !originalError.path) {
    originalError.path = error.path;
  }

  try {
    // For correlating user error reports with logs
    error.uid = cuid();

    if (isApolloErrorInstance(originalError)) {
      // log internalData to stdout but not include it in the formattedError
      // TODO: User pino for logging
      graphqlLogger.info({
        type: 'error',
        data: originalError.data,
        internalData: originalError.internalData,
      });
    } else {
      const exception = originalError || (error.extensions && error.extensions.exception);
      if (exception) {
        const pinoError = {
          ...omit(serializeError(error), ['extensions']),
          ...omit(exception, ['name', 'model', 'stacktrace']),
          stack: stackUtil.clean(exception.stacktrace || exception.stack),
        };

        if (pinoError.errors) {
          pinoError.errors = flattenNestedErrors(exception).map(safeFormatError);
        }

        graphqlLogger.error(pinoError);
      } else {
        const errorOutput = serializeError(ensureError(error));
        errorOutput.stack = stackUtil.clean(errorOutput.stack);
        graphqlLogger.error(errorOutput);
      }
    }
  } catch (formatErrorError) {
    // Something went wrong with formatting above, so we log the errors
    graphqlLogger.error(serializeError(ensureError(error)));
    graphqlLogger.error(serializeError(ensureError(formatErrorError)));

    return safeFormatError(error);
  }

  try {
    let formattedError;

    // Support throwing multiple errors
    if (originalError && originalError.errors) {
      const multipleErrorContainer = new NestedError({
        data: {
          // Format (aka; serialize) the error
          errors: flattenNestedErrors(originalError).map(safeFormatError),
        },
      });

      formattedError = safeFormatError(multipleErrorContainer);
    } else {
      formattedError = safeFormatError(error);
    }

    if (error.uid) {
      formattedError.uid = error.uid;
    }

    return formattedError;
  } catch (formatErrorError) {
    // NOTE: We don't log again here as we assume the earlier try/catch
    // correctly logged

    // Return the original error as a fallback so the client gets at
    // least some useful info
    return safeFormatError(error);
  }
};

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
  if (falsey(process.env.DISABLE_LOGGING)) {
    const url = `http://localhost:${port}${path}`;
    const prettyUrl = chalk.blue(url);
    const link = terminalLink(prettyUrl, url, { fallback: () => prettyUrl });
    const versionString = version ? ` (v${version})` : '';
    console.log(`🔗 ${chalk.green(text)} ${link}${versionString}`);
  }
};

module.exports = function createGraphQLMiddleware(
  keystone,
  { apiPath, graphiqlPath, apolloConfig, port }
) {
  const app = express();

  if (graphiqlPath) {
    ttyLink('GraphQL Playground:', graphiqlPath, port, playgroundPkg.version);
    app.use(graphiqlPath, graphiqlMiddleware(apiPath));
    if (process.env.NODE_ENV !== 'production' && falsey(process.env.DISABLE_LOGGING)) {
      const devQueryPath = `${graphiqlPath}/go`;
      ttyLink('GraphQL Debug Links:', devQueryPath, port);

      // NOTE: Must come before we setup the API below
      addDevQueryMiddlewares(app, apiPath, graphiqlPath, devQueryPath);
    }
  }

  // add the Admin GraphQL API
  const server = new ApolloServer({
    maxFileSize: 200 * 1024 * 1024,
    maxFiles: 5,
    ...apolloConfig,
    ...keystone.getAdminSchema(),
    context: ({ req }) => keystone.getAccessContext(req),
    ...(process.env.ENGINE_API_KEY
      ? {
          engine: { apiKey: process.env.ENGINE_API_KEY },
          tracing: true,
        }
      : {
          engine: false,
          tracing: process.env.NODE_ENV !== 'production',
        }),
    formatError: _formatError,
  });
  keystone.registerGraphQLQueryMethod((query, context, variables) =>
    graphql(server.schema, query, null, context, variables)
  );

  ttyLink('GraphQL API:', apiPath, port);
  // { cors: false } - prevent ApolloServer from overriding Keystone's CORS configuration.
  // https://www.apollographql.com/docs/apollo-server/api/apollo-server.html#ApolloServer-applyMiddleware
  server.applyMiddleware({ app, path: apiPath, cors: false });

  return app;
};
