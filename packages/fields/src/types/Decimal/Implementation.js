import mongoose from 'mongoose';
import { Decimal as _Decimal } from 'decimal.js';
import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystone-next/adapter-mongoose-legacy';
import { KnexFieldAdapter } from '@keystone-next/adapter-knex-legacy';
import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';

export class Decimal extends Implementation {
  constructor(path, { symbol }) {
    super(...arguments);
    this.symbol = symbol;
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: String`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('String'),
      ...this.orderingInputFields('String'),
      ...(this.adapter.listAdapter.parentAdapter.name === 'prisma_postgresql'
        ? []
        : this.inInputFields('String')),
    ];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: String`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: String`];
  }
  extendAdminMeta(meta) {
    return {
      ...meta,
      symbol: this.symbol,
    };
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'string | null' } };
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
      // Only run the hook if the item actually contains the field
      // NOTE: Can't use hasOwnProperty here, as the mongoose data object
      // returned isn't a POJO
      if (!(this.path in item)) {
        return item;
      }

      if (item[this.path]) {
        if (typeof item[this.path] === 'string') {
          item[this.path] = mongoose.Types.Decimal128.fromString(item[this.path]);
        } else {
          // Should have been caught by the validator??
          throw `Invalid Decimal value given for '${this.path}'`;
        }
      } else {
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
      ...this.equalityConditions(dbPath, s => s && mongoose.Types.Decimal128.fromString(s)),
      ...this.orderingConditions(dbPath, s => s && mongoose.Types.Decimal128.fromString(s)),
      ...this.inConditions(dbPath, s => s && mongoose.Types.Decimal128.fromString(s)),
    };
  }
}

export class KnexDecimalInterface extends KnexFieldAdapter {
  constructor() {
    super(...arguments);
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;

    // In addition to the standard knexOptions this type supports precision and scale
    const precision = this.config.precision || this.knexOptions.precision || null;
    const scale = this.config.scale || this.knexOptions.scale || null;
    this.precision = precision === null ? null : parseInt(precision) || 18;
    this.scale = scale === null ? null : (this.precision, parseInt(scale) || 4);
    if (this.scale !== null && this.precision !== null && this.scale > this.precision) {
      throw (
        `The scale configured for Decimal field '${this.path}' (${this.scale}) ` +
        `must not be larger than the field's precision (${this.precision})`
      );
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

export class PrismaDecimalInterface extends PrismaFieldAdapter {
  constructor() {
    super(...arguments);
    if (this.listAdapter.parentAdapter.provider === 'sqlite') {
      throw new Error(
        `PrismaAdapter provider "sqlite" does not support field type "${this.field.constructor.name}"`
      );
    }
    const { precision, scale } = this.config;
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;

    // In addition to the standard knexOptions this type supports precision and scale
    // const { precision, scale } = this.knexOptions;
    this.precision = precision === null ? null : parseInt(precision) || 18;
    this.scale = scale === null ? null : (this.precision, parseInt(scale) || 4);
    if (this.scale !== null && this.precision !== null && this.scale > this.precision) {
      throw (
        `The scale configured for Decimal field '${this.path}' (${this.scale}) ` +
        `must not be larger than the field's precision (${this.precision})`
      );
    }
  }

  getPrismaSchema() {
    return this._schemaField({
      type: 'Decimal',
      extra: `@postgresql.Decimal(${this.precision}, ${this.scale})`,
    });
  }

  setupHooks({ addPreSaveHook, addPostReadHook }) {
    // Updates the relevant value in the item provided (by reference)
    addPreSaveHook(item => {
      // Only run the hook if the item actually contains the field
      if (!(this.path in item)) {
        return item;
      }

      if (item[this.path]) {
        if (typeof item[this.path] === 'string') {
          item[this.path] = new _Decimal(item[this.path]);
        } else {
          // Should have been caught by the validator??
          throw `Invalid Decimal value given for '${this.path}'`;
        }
      } else {
        item[this.path] = null;
      }

      return item;
    });

    addPostReadHook(item => {
      if (item[this.path]) {
        item[this.path] = item[this.path].toFixed(this.scale);
      }
      return item;
    });
  }

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath),
      ...this.orderingConditions(dbPath),
    };
  }
}
