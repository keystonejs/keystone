// This module provides a mechanism for catching every query to a graphQL endpoint
// and creating a unique link which can be used to repeat the query within the graphiql playground.

const gql = require('graphql-tag');
const hash = require('object-hash');
const chalk = require('chalk');
const terminalLink = require('terminal-link');
const querystring = require('querystring');
const bodyParser = require('body-parser');

const chalkColour = new chalk.Instance({ enabled: true, level: 3 });

const buildGraphiqlQueryParams = ({ query, variables }) =>
  querystring.stringify({
    query,
    variables: JSON.stringify(variables),
  });

const graphiqlDevQueryMiddleware = (graphiqlPath, devQueryPath, devQueryLog) => (
  req,
  res,
  next
) => {
  if (
    // Skip requests from graphiql itself
    (req.headers.referer && req.headers.referer.includes(graphiqlPath)) ||
    // Skip multipart form requests (ie; when using the Upload type)
    !req.body.query
  ) {
    return next();
  }

  // hash query into id so that identical queries occupy
  // the same space in the devQueryLog map.
  const id = hash({ query: req.body.query, variables: req.body.variables });

  // Store the loadable GraphiQL URL against that id
  const queryParams = buildGraphiqlQueryParams(req.body);
  devQueryLog[id] = `${graphiqlPath}?${queryParams}`;

  const ast = gql(req.body.query);

  const operations = ast.definitions.map(
    def => `${def.operation} ${def.name ? `${def.name.value} ` : ''}{ .. }`
  );

  // Make the queries clickable in the terminal where supported
  console.log(
    terminalLink(
      `${chalk.blue(operations.map(op => chalkColour.bold(op)).join(', '))}${
        terminalLink.isSupported ? ` (👈 click to view)` : ''
      }`,
      `${req.protocol}://${req.get('host')}${devQueryPath}?id=${id}`,
      {
        // Otherwise, show the link on a new line
        fallback: (text, url) => `${text}\n${chalkColour.gray(` ⤷ inspect @ ${url}`)}`,
      }
    )
  );

  // finally pass requests to the actual graphql endpoint
  next();
};

const graphiqlDevQueryRedirector = (graphiqlPath, devQueryLog) => (req, res) => {
  const { id } = req.query;
  if (!devQueryLog[id]) {
    const queryParams = buildGraphiqlQueryParams({
      query: `# Unable to locate query '${id}'.\n# NOTE: You may have restarted your dev server. Doing so will clear query short URLs.`,
    });
    return res.redirect(`${graphiqlPath}?${queryParams}`);
  }
  return res.redirect(devQueryLog[id]);
};

const addDevQueryMiddlewares = (app, apiPath, graphiqlPath, devQueryPath) => {
  // Needed to read the body contents out below
  app.use(bodyParser.json());

  const devQueryLog = {};
  // peeks at incoming graphql requests and builds shortlinks
  // NOTE: Must come before we setup the API below
  app.use(apiPath, graphiqlDevQueryMiddleware(graphiqlPath, devQueryPath, devQueryLog));
  // parses shortlinks and redirects to the GraphiQL editor

  app.use(devQueryPath, graphiqlDevQueryRedirector(graphiqlPath, devQueryLog));
};

module.exports = { addDevQueryMiddlewares };
