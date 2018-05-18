const {
  Schema: {
    Types: { ObjectId },
  },
} = require('mongoose');

const Implementation = require('../../Implementation');

module.exports = class Select extends Implementation {
  constructor() {
    super(...arguments);
  }
  getGraphqlSchema() {
    const { many } = this.config;
    const type = many ? '[String]' : 'String';
    return `${this.path}: ${type}`;
  }
  addToMongooseSchema(schema) {
    const { many, mongooseOptions, ref } = this.config;
    const type = many ? [ObjectId] : ObjectId;
    schema.add({
      [this.path]: { type, ref, ...mongooseOptions },
    });
  }
  extendAdminMeta(meta) {
    const { many, ref } = this.config;
    return { ...meta, ref, many };
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
    const { many } = this.config;
    const type = many ? '[String]' : 'String';
    return `${this.path}: ${type}`;
  }
  getGraphqlCreateArgs() {
    return this.getGraphqlUpdateArgs();
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
