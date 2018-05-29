const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapters/mongoose');

class Password extends Implementation {
  constructor() {
    super(...arguments);
    this.graphQLType = 'String';
  }
  getGraphqlQueryArgs() {
    return `
      ${this.path}_is_set: Boolean
    `;
  }
  getGraphqlUpdateArgs() {
    return `
      ${this.path}: String
    `;
  }
  getGraphqlCreateArgs() {
    return `
      ${this.path}: String
    `;
  }
}

class MongoPasswordInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    schema.add({
      [this.path]: { type: String, ...mongooseOptions },
    });
  }

  getQueryConditions(args) {
    const conditions = [];
    const is_set = `${this.path}_is_set`;
    if (is_set in args) {
      conditions.push(args[is_set] ? { $ne: null } : null);
    }
    return conditions;
  }
}

module.exports = {
  Password,
  MongoPasswordInterface,
};
