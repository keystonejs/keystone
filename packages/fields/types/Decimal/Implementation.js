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
    return {
      ...meta,
      symbol: this.config.symbol,
    };
  }
}

class MongoDecimalInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions, unique } = this.config;
    const required = mongooseOptions && mongooseOptions.required;

    const isValidDecimal = s => /^-?\d*\.?\d*$/.test(s);

    schema.add({
      [this.path]: {
        type: mongoose.Decimal128,
        unique,
        validate: {
          validator: required
            ? isValidDecimal
            : a => {
                if (typeof a === 'object') return true;
                if (typeof a === 'undefined' || a === null) return true;
                return false;
              },
          message: '{VALUE} is not a Decimal value',
        },
        ...mongooseOptions,
      },
    });
    // Updates the relevant value in the item provided (by referrence)
    this.addToServerHook(schema, item => {
      if (item[this.path] && typeof item[this.path] === 'string') {
        item[this.path] = mongoose.Types.Decimal128.fromString(item[this.path]);
      } else if (!item[this.path]) {
        item[this.path] = null;
      }
      // else: Must either be undefined or a Decimal128 object, so leave it alone.
    });
    this.addToClientHook(schema, item => {
      if (item[this.path]) {
        item[this.path] = item[this.path].toString();
      }
    });
  }

  getQueryConditions() {
    return {
      [this.path]: value => ({ [this.path]: { $eq: mongoose.Types.Decimal128.fromString(value) } }),
      [`${this.path}_not`]: value => ({
        [this.path]: { $ne: mongoose.Types.Decimal128.fromString(value) },
      }),
      [`${this.path}_lt`]: value => ({
        [this.path]: { $lt: mongoose.Types.Decimal128.fromString(value) },
      }),
      [`${this.path}_lte`]: value => ({
        [this.path]: { $lte: mongoose.Types.Decimal128.fromString(value) },
      }),
      [`${this.path}_gt`]: value => ({
        [this.path]: { $gt: mongoose.Types.Decimal128.fromString(value) },
      }),
      [`${this.path}_gte`]: value => ({
        [this.path]: { $gte: mongoose.Types.Decimal128.fromString(value) },
      }),
    };
  }
}

module.exports = {
  Decimal,
  MongoDecimalInterface,
};
