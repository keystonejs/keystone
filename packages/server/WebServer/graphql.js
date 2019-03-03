const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { formatError, isInstance: isApolloErrorInstance } = require('apollo-errors');
const { renderPlaygroundPage } = require('graphql-playground-html');
const playgroundPkg = require('graphql-playground-react/package.json');
const gql = require('graphql-tag');
const cuid = require('cuid');
const hash = require('object-hash');
const chalk = require('chalk');
const logger = require('@voussoir/logger');
const falsey = require('falsey');
const { omit } = require('@voussoir/utils');
const { graphql } = require('graphql');
const StackUtils = require('stack-utils');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const ensureError = require('ensure-error');
const terminalLink = require('terminal-link');
const serializeError = require('serialize-error');

const { NestedError } = require('./graphqlErrors');

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

const buildGraphiqlQueryParams = ({ query, variables }) =>
  querystring.stringify({
    query,
    variables: JSON.stringify(variables),
  });

module.exports = function createGraphQLMiddleware(
  keystone,
  { apiPath, graphiqlPath, apolloConfig }
) {
  const app = express();

  const devQueryLog = {};
  const devLoggingEnabled =
    process.env.NODE_ENV !== 'production' && falsey(process.env.DISABLE_LOGGING);

  if (graphiqlPath && devLoggingEnabled) {
    // Needed to read the body contents out below
    app.use(bodyParser.json());

    const chalkColour = new chalk.constructor({ enabled: true, level: 3 });

    // peeks at incoming graphql requests and builds shortlinks
    // NOTE: Must come before we setup the API below
    app.use(apiPath, (req, res, next) => {
      // Skip requests from graphiql itself
      if (req.headers.referer && req.headers.referer.includes(graphiqlPath)) {
        return next();
      }

      // hash query into id so that identical queries occupy
      // the same space in the devQueryLog map.
      const id = hash({ query: req.body.query, variables: req.body.variables });

      // Store the loadable GraphiQL URL against that id
      const queryParams = buildGraphiqlQueryParams(req.body);
      devQueryLog[id] = `${graphiqlPath}?${queryParams}`;

      const ast = gql(req.body.query);
      
      const operations = ast.definitions.map(def => `${def.operation} ${def.name ? `${def.name.value} ` : ''}{ .. }`);

      // Make the queries clickable in the terminal where supported
      console.log(
        terminalLink(
          `${chalk.blue(operations.map(op => chalkColour.bold(op)).join(', '))}${
            terminalLink.isSupported ? ` (👈 click to view)` : ''
          }`,
          `${req.protocol}://${req.get('host')}${graphiqlPath}/go?id=${id}`,
          {
            // Otherwise, show the link on a new line
            fallback: (text, url) => `${text}\n${chalkColour.gray(` ⤷ inspect @ ${url}`)}`,
          }
        )
      );

      // finally pass requests to the actual graphql endpoint
      next();
    });
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
          engine: {
            apiKey: process.env.ENGINE_API_KEY,
          },
          tracing: true,
        }
      : {
          engine: false,
          tracing: process.env.NODE_ENV !== 'production',
        }),
    formatError: error => {
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
    },
  });

  if (falsey(process.env.DISABLE_LOGGING)) {
    console.log(`[ROUTE ${apiPath}]: GraphQL API`);
  }
  server.applyMiddleware({
    app,
    path: apiPath,
    // Prevent ApolloServer from overriding Keystone's CORS configuration.
    // https://www.apollographql.com/docs/apollo-server/api/apollo-server.html#ApolloServer-applyMiddleware
    cors: false,
  });

  if (graphiqlPath) {
    if (devLoggingEnabled) {
      // parses shortlinks and redirects to the GraphiQL editor
      console.log(`[ROUTE ${graphiqlPath}/go]: GraphQL Playground short links`);
      app.use(`${graphiqlPath}/go`, (req, res) => {
        const { id } = req.query;
        if (!devQueryLog[id]) {
          const queryParams = buildGraphiqlQueryParams({
            query: `# Unable to locate query '${id}'.\n# NOTE: You may have restarted your dev server. Doing so will clear query short URLs.`,
          });
          return res.redirect(`${graphiqlPath}?${queryParams}`);
        }
        return res.redirect(devQueryLog[id]);
      });
    }

    if (falsey(process.env.DISABLE_LOGGING)) {
      console.log(`[ROUTE ${graphiqlPath}]: GraphQL Playground (v${playgroundPkg.version})`);
    }
    app.use(graphiqlPath, (req, res) => {
      const tab = {
        endpoint: apiPath,
      };

      if (req.query && req.query.query) {
        tab.query = req.query.query;
        tab.variables = req.query.variables;
      }

      res.setHeader('Content-Type', 'text/html');
      res.write(
        renderPlaygroundPage({ endpoint: apiPath, version: playgroundPkg.version, tabs: [tab] })
      );
      res.end();
    });
  }

  keystone.registerGraphQLQueryMethod((query, context, variables) =>
    graphql(server.schema, query, null, context, variables)
  );

  return app;
};
