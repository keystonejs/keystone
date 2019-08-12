import mongoose from 'mongoose';
import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystone-alpha/adapter-mongoose';
import { KnexFieldAdapter } from '@keystone-alpha/adapter-knex';

export class Decimal extends Implementation {
  constructor(path, { symbol }) {
    super(...arguments);
    this.symbol = symbol;
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
      symbol: this.symbol,
    };
  }
}

export class MongoDecimalInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const validator = a => typeof a === 'object' && /^-?\d*\.?\d*$/.test(a);
    const schemaOptions = {
      type: mongoose.Decimal128,
      validate: {
        validator: this.buildValidator(validator),
        message: '{VALUE} is not a Decimal value',
      },
    };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }

  setupHooks({ addPreSaveHook, addPostReadHook }) {
    // Updates the relevant value in the item provided (by reference)
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

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath, mongoose.Types.Decimal128.fromString),
      ...this.orderingConditions(dbPath, mongoose.Types.Decimal128.fromString),
      ...this.inConditions(dbPath, mongoose.Types.Decimal128.fromString),
    };
  }
}

export class KnexDecimalInterface extends KnexFieldAdapter {
  constructor() {
    super(...arguments);
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;

    // In addition to the standard knexOptions this type supports precision and scale
    const { precision, scale } = this.knexOptions;
    this.precision = precision === null ? null : parseInt(precision) || 18;
    this.scale = scale === null ? null : (this.precision, parseInt(scale) || 4);
    if (this.scale !== null && this.precision !== null && this.scale > this.precision) {
      throw `The scale configured for Decimal field '${this.path}' (${this.scale}) ` +
        `must not be larger than the field's precision (${this.precision})`;
    }
  }

  addToTableSchema(table) {
    const column = table.decimal(this.path, this.precision, this.scale);
    if (this.isUnique) column.unique();
    else if (this.isIndexed) column.index();
    if (this.isNotNullable) column.notNullable();
    if (typeof this.defaultTo !== 'undefined') column.defaultTo(this.defaultTo);
  }

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath),
      ...this.orderingConditions(dbPath),
      ...this.inConditions(dbPath),
    };
  }
}
