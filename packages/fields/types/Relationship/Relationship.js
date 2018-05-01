const { Schema: { Types: { ObjectId } } } = require('mongoose');

const Field = require('../../Field');

module.exports = class Select extends Field {
  constructor(path, config) {
    super(path, config);
  }
  getGraphqlSchema() {
    return `${this.path}: String`;
  }
  addToMongooseSchema(schema) {
    const { mongooseOptions, ref } = this.config;
    schema.add({
      [this.path]: { type: ObjectId, ref, ...mongooseOptions },
    });
  }
  extendAdminMeta(meta) {
    return { ...meta, ref: this.config.ref };
  }
  getGraphqlQueryArgs() {
    return `
      ${this.path}: String
      ${this.path}_not: String
      ${this.path}_in: [String!]
      ${this.path}_not_in: [String!]
    `;
  }
  getGraphqlUpdateArgs() {
    return this.getGraphqlSchema();
  }
  getGraphqlCreateArgs() {
    return this.getGraphqlSchema();
  }
  getQueryConditions(args) {
    const conditions = [];
    const eq = this.path;
    if (eq in args) {
      conditions.push({ $eq: args[eq] });
    }
    const not = `${this.path}_not`;
    if (not in args) {
      conditions.push({ $ne: args[not] });
    }
    const is_in = `${this.path}_in`;
    if (is_in in args) {
      conditions.push({ $in: args[is_in] });
    }
    const not_in = `${this.path}_not_in`;
    if (not_in in args) {
      conditions.push({ $nin: args[not_in] });
    }
    return conditions;
  }
};
