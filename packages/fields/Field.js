const inflection = require('inflection');

module.exports = class Field {
  constructor(path, { listKey, ...config }) {
    this.path = path;
    this.config = config;
    this.listKey = listKey;
    this.label = config.label || inflection.humanize(path);
    // LB: At some point we might like to allow extending views from the config
    this.views = {};
    this.basePath = '';
  }
  addToMongooseSchema() {
    throw new Error(
      `Field type [${
        this.constructor.name
      }] does not implement addToMongooseSchema()`
    );
  }
  getGraphqlSchema() {
    if (!this.graphQLType) {
      throw new Error(
        `Field type [${this.constructor.name}] does not implement graphQLType`
      );
    }
    return `${this.path}: ${this.graphQLType}`;
  }
  getGraphqlTypes() {}
  getGraphqlQueryArgs() {}
  addFiltersToQuery() {}
  getAdminMeta() {
    return this.extendAdminMeta({
      label: this.label,
      path: this.path,
      type: this.constructor.name,
      views: this.views,
      basePath: this.basePath
    });
  }
  extendAdminMeta(meta) {
    return meta;
  }
};

/*
Idea for field spec export:

module.exports = {
  type: 'Password',
  implementation: Password,
  views: {
    Field: './views/Field',
    Column: './views/Column',
  },
  adapters: {
    mongoose: require('./adapters/mongoose'),
    postgres: require('./adapters/postgres'),
  }
}
*/
