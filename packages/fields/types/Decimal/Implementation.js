const mongoose = require('mongoose');
const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');

class Decimal extends Implementation {
  constructor() {
    super(...arguments);
  }

  get gqlOutputFields() {
    return [`${this.path}: String`];
  }
  get gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  get gqlQueryInputFields() {
    return [
      `${this.path}: String`,
      `${this.path}_not: String`,
      `${this.path}_lt: String`,
      `${this.path}_lte: String`,
      `${this.path}_gt: String`,
      `${this.path}_gte: String`,
      `${this.path}_in: [String]`,
      `${this.path}_not_in: [String]`,
    ];
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: String`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: String`];
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

    const isValidDecimal = s => /^-?\d*\.?\d*$/.test(s) === s;

    schema.add({
      [this.path]: {
        type: mongoose.Decimal128,
        unique,
        validate: {
          validator: required
            ? isValidDecimal
            : a => {
              if (typeof a === 'decimal' && isValidDecimal(a)) return true;
              if (typeof a === 'undefined' || a === null) return true;
              return false;
            },
          message: '{VALUE} is not a Decimal value',
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
    };
  }
}


module.exports = {
  Decimal,
  MongoDecimalInterface,
};
