const express = require('express');
const { graphqlUploadExpress } = require('graphql-upload');
const validation = require('./validation');

class GraphQLApp {
  constructor({ apiPath = '/admin/api', schemaName = 'public', apollo = {} } = {}) {
    if (schemaName === 'internal') {
      throw new Error(
        "The schemaName 'internal' is a reserved name cannot be used in a GraphQLApp."
      );
    }

    this._apiPath = apiPath;
    this._apollo = apollo;
    this._schemaName = schemaName;
  }

  /**
   * @return Array<middlewares>
   */
  prepareMiddleware({ keystone, dev }) {
    const server = keystone.createApolloServer({
      apolloConfig: this._apollo,
      schemaName: this._schemaName,
      dev,
    });
    const apiPath = this._apiPath;
    const app = express();

    const maxFileSize = (this._apollo && this._apollo.maxFileSize) || 200 * 1024 * 1024;
    const maxFiles = (this._apollo && this._apollo.maxFileSize) || 5;
    app.use(graphqlUploadExpress({ maxFileSize, maxFiles }));
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
