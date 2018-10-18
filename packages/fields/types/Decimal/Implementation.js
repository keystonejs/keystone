const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');

class Decimal extends Implementation {
  constructor() {
    super(...arguments);
  }

  get gqlOutputFields() {
    return [`${this.path}: Int`];
  }
  get gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  get gqlQueryInputFields() {
    return [
      `${this.path}: Int`,
      `${this.path}_not: Int`,
      `${this.path}_lt: Int`,
      `${this.path}_lte: Int`,
      `${this.path}_gt: Int`,
      `${this.path}_gte: Int`,
      `${this.path}_in: [Int]`,
      `${this.path}_not_in: [Int]`,
    ];
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: Int`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: Int`];
  }
  extendAdminMeta(meta) {
    return ({
      ...meta,
      digits: this.config.digits,
      symbol: this.config.symbol,
      currency: this.config.currency,
    });
  }
}

class MongoDecimalInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions, unique } = this.config;
    const required = mongooseOptions && mongooseOptions.required;

    schema.add({
      [this.path]: {
        type: Number,
        unique,
        validate: {
          validator: required
            ? Number.isInteger
            : a => {
                if (typeof a === 'number' && Number.isInteger(a)) return true;
                if (typeof a === 'undefined' || a === null) return true;
                return false;
              },
          message: '{VALUE} is not a integer value',
        },
        ...mongooseOptions,
      },
    });
  }

  getQueryConditions() {
    return {
      [this.path]: value => ({ [this.path]: { $eq: value } }),
      [`${this.path}_not`]: value => ({ [this.path]: { $ne: value } }),
      [`${this.path}_lt`]: value => ({ [this.path]: { $lt: value } }),
      [`${this.path}_lte`]: value => ({ [this.path]: { $lte: value } }),
      [`${this.path}_gt`]: value => ({ [this.path]: { $gt: value } }),
      [`${this.path}_gte`]: value => ({ [this.path]: { $gte: value } }),
      [`${this.path}_in`]: value => ({ [this.path]: { $in: value } }),
      [`${this.path}_not_in`]: value => ({ [this.path]: { $not: { $in: value } } }),
    };
  }
}

module.exports = {
  Decimal,
  MongoDecimalInterface,
};
