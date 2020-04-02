const express = require('express');
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
    const apiPath = this._apiPath;
    const graphiqlPath = this._graphiqlPath;
    const app = express();

    if (dev && graphiqlPath) {
      // This is a convenience to make the out of the box experience slightly simpler.
      // We should reconsider support for this at some point in the future. -TL
      app.use(
        new GraphQLPlaygroundApp({ apiPath, graphiqlPath }).prepareMiddleware({ keystone, dev })
      );
    }

    // { cors: false } - prevent ApolloServer from overriding Keystone's CORS configuration.
    // https://www.apollographql.com/docs/apollo-server/api/apollo-server.html#ApolloServer-applyMiddleware
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
