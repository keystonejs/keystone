const express = require('express');
const { restrictAudienceMiddleware } = require('@keystonejs/session');
const { GraphQLPlaygroundApp } = require('@keystonejs/app-graphql-playground');
const { createApolloServer } = require('./lib/apolloServer');
const validation = require('./validation');

class GraphQLApp {
  constructor({
    apiPath = '/admin/api',
    graphiqlPath = '/admin/graphiql',
    schemaName = 'public',
    apollo = {},
  } = {}) {
    this._apiPath = apiPath;
    this._graphiqlPath = graphiqlPath;
    this._apollo = apollo;
    this._schemaName = schemaName;
  }

  /**
   * @return Array<middlewares>
   */
  prepareMiddleware({ keystone, dev }) {
    const server = createApolloServer(keystone, this._apollo, this._schemaName, dev);
    // GraphQL API always exists independent of any adminUI or Session
    // settings We currently make the admin UI public. In the future we want
    // to be able to restrict this to a limited audience, while setting up a
    // separate public API with much stricter access control.
    const apiPath = this._apiPath;
    const graphiqlPath = this._graphiqlPath;
    const app = express();

    if (graphiqlPath) {
      // This is a convenience to make the out of the box experience slightly simpler.
      // We should reconsider support for this at some point in the future. -TL
      app.use(
        new GraphQLPlaygroundApp({ apiPath, graphiqlPath }).prepareMiddleware({ keystone, dev })
      );
    }

    // { cors: false } - prevent ApolloServer from overriding Keystone's CORS configuration.
    // https://www.apollographql.com/docs/apollo-server/api/apollo-server.html#ApolloServer-applyMiddleware
    // This probably isn't the right place to put this restriction middleware. -TL
    const restrict = restrictAudienceMiddleware({ isPublic: true });
    app.use(apiPath, restrict);
    app.use(server.getMiddleware({ path: apiPath, cors: false }));
    return app;
  }

  /**
   * @param Options { distDir }
   */
  build() {}
}

module.exports = {
  GraphQLApp,
  validation,
};
