const mongoose = require('mongoose');
const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');
const { KnexFieldAdapter } = require('@voussoir/adapter-knex');

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
      ...this.equalityInputFields('String'),
      ...this.orderingInputFields('String'),
      ...this.inInputFields('String'),
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
  addToMongooseSchema(schema, _, { addPreSaveHook, addPostReadHook }) {
    const { mongooseOptions = {} } = this.config;
    const { isRequired } = mongooseOptions;

    const validator = a => typeof a === 'object' && /^-?\d*\.?\d*$/.test(a);
    const schemaOptions = {
      type: mongoose.Decimal128,
      validate: {
        validator: this.buildValidator(validator, isRequired),
        message: '{VALUE} is not a Decimal value',
      },
    };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });

    // Updates the relevant value in the item provided (by referrence)
    addPreSaveHook(item => {
      if (item[this.path] && typeof item[this.path] === 'string') {
        item[this.path] = mongoose.Types.Decimal128.fromString(item[this.path]);
      } else if (!item[this.path]) {
        item[this.path] = null;
      }
      // else: Must either be undefined or a Decimal128 object, so leave it alone.
      return item;
    });
    addPostReadHook(item => {
      if (item[this.path]) {
        item[this.path] = item[this.path].toString();
      }
      return item;
    });
  }

  getQueryConditions() {
    return {
      ...this.equalityConditions(mongoose.Types.Decimal128.fromString),
      ...this.orderingConditions(mongoose.Types.Decimal128.fromString),
      ...this.inConditions(mongoose.Types.Decimal128.fromString),
    };
  }
}

class KnexDecimalInterface extends KnexFieldAdapter {
  createColumn(table) {
    table.decimal(this.path);
  }
  getQueryConditions(f, g) {
    return {
      ...this.equalityConditions(f, g),
      ...this.orderingConditions(f, g),
      ...this.inConditions(f, g),
    };
  }
}

module.exports = {
  Decimal,
  MongoDecimalInterface,
  KnexDecimalInterface,
};
