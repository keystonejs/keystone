import { Decimal as _Decimal } from 'decimal.js';
import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Implementation } from '@keystone-next/fields-legacy';

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
      ...(this.adapter.listAdapter.parentAdapter.name === 'postgresql'
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
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'string | null' } };
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
