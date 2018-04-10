const inflection = require('inflection');

module.exports = class Field {
  constructor(path, config) {
    this.path = path;
    this.config = config;
    this.label = config.label || inflection.humanize(path);
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
  getAdminMeta() {
    return this.extendAdminMeta({
      label: this.label,
      path: this.path,
      type: this.constructor.name,
    });
  }
  extendAdminMeta(meta) {
    return meta;
  }
};
