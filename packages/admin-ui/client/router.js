const { pick, omit } = require('@keystone-alpha/utils');

const withTo = ({ route, page, defaultParams = {} }, params = []) => ({
  route,
  page,
  defaultParams,
  to: (inputQuery = {}) => {
    const query = {
      ...defaultParams,
      ...inputQuery,
    };

    params.forEach(param => {
      if (!query[param]) {
        throw new Error(
          `Missing param '${param}' in route '${route}'. Received: ${JSON.stringify(query)}.`
        );
      }
    });
    const urlParts = pick(query, params);
    const urlQuery = omit(query, params);
    return {
      href: {
        pathname: page,
        // Use all the input query items
        query,
      },
      as: {
        pathname: params.reduce((memo, param) => memo.replace(`:${param}`, urlParts[param]), route),
        // Add only the remaining query items (if any)
        query: urlQuery,
      },
    };
  },
});

/**
 * Order is important.
 *
 * @param adminPath String A base path. Must have a leading '/'
 */
module.exports = (adminPath, customPages = {}) => ({
  'style-guide': withTo({
    route: `${adminPath}/style-guide`,
    page: '/style-guide',
  }),
  login: withTo({
    route: `${adminPath}/login`,
    page: '/login',
  }),
  signout: withTo({
    route: `${adminPath}/signout`,
    page: '/signout',
  }),
  ...Object.entries(customPages).reduce((memo, [path, { component }]) => {
    memo[path] = withTo(
      {
        route: `${adminPath}/${path.replace(/(^\/+)|(\/+$)/g, '')}`,
        page: '/custom',
        defaultParams: { path, component },
      },
      ['path', 'component']
    );
    return memo;
  }, {}),
  item: withTo(
    {
      route: `${adminPath}/:listPath/:itemId`,
      page: '/item',
    },
    ['listPath', 'itemId']
  ),
  list: withTo(
    {
      route: `${adminPath}/:listPath`,
      page: '/list',
    },
    ['listPath']
  ),
  index: withTo({
    route: adminPath,
    page: '/index',
  }),
});
