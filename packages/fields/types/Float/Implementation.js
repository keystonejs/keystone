const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');

class Float extends Implementation {
  constructor() {
    super(...arguments);
    this.graphQLType = 'Float';
  }

  getGraphqlQueryArgs() {
    return `
      ${this.path}: Float
      ${this.path}_not: Float
      ${this.path}_lt: Float
      ${this.path}_lte: Float
      ${this.path}_gt: Float
      ${this.path}_gte: Float
      ${this.path}_in: [Float]
      ${this.path}_not_in: [Float]
    `;
  }
  getGraphqlUpdateArgs() {
    return `
      ${this.path}: Float
    `;
  }
  getGraphqlCreateArgs() {
    return `
      ${this.path}: Float
    `;
  }
}

class MongoFloatInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    schema.add({
      [this.path]: { type: Number, ...mongooseOptions },
    });
  }

  getQueryConditions(args) {
    const conditions = [];
    if (!args) {
      return conditions;
    }

    const eq = this.path;
    if (eq in args) {
      conditions.push({ $eq: args[eq] });
    }
    const not = `${this.path}_not`;
    if (not in args) {
      conditions.push({ $ne: args[not] });
    }
    const lt = `${this.path}_lt`;
    if (lt in args) {
      conditions.push({ $lt: args[lt] });
    }
    const lte = `${this.path}_lte`;
    if (lte in args) {
      conditions.push({ $lte: args[lte] });
    }
    const gt = `${this.path}_gt`;
    if (gt in args) {
      conditions.push({ $gt: args[gt] });
    }
    const gte = `${this.path}_gte`;
    if (gte in args) {
      conditions.push({ $gte: args[gte] });
    }
    const is_in = `${this.path}_in`;
    if (is_in in args) {
      conditions.push({ $in: args[is_in] });
    }
    const not_in = `${this.path}_not_in`;
    if (not_in in args) {
      conditions.push({ $not: { $in: args[not_in] } });
    }
    return conditions;
  }
}

module.exports = {
  Float,
  MongoFloatInterface,
};
