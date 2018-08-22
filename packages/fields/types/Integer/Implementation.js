const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');

class Integer extends Implementation {
  constructor() {
    super(...arguments);
  }

  getGraphqlOutputFields() {
    return `
      ${this.path}: Int
    `;
  }
  getGraphqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  getGraphqlQueryArgs() {
    return `
        ${this.path}: Int
        ${this.path}_not: Int
        ${this.path}_lt: Int
        ${this.path}_lte: Int
        ${this.path}_gt: Int
        ${this.path}_gte: Int
        ${this.path}_in: [Int]
        ${this.path}_not_in: [Int]
    `;
  }
  getGraphqlUpdateArgs() {
    return `
      ${this.path}: Int
    `;
  }
  getGraphqlCreateArgs() {
    return `
      ${this.path}: Int
    `;
  }
}

class MongoIntegerInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    const required = mongooseOptions && mongooseOptions.required;

    schema.add({
      [this.path]: {
        type: Number,
        validate: {
          validator: required
            ? Number.isInteger
            : a => {
                if (typeof a === 'number' && Number.isInteger(a)) return true;
                if (typeof a === 'undefined' || a === null) return true;
                return false;
              },
          message: '{VALUE} is not an integer value',
        },
        ...mongooseOptions,
      },
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
  Integer,
  MongoIntegerInterface,
};
