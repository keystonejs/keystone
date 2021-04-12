import { Decimal as _Decimal } from 'decimal.js';
import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { FieldConfigArgs, FieldExtraArgs, Implementation } from '../../Implementation';

type List = { adapter: PrismaListAdapter };

export class Decimal<P extends string> extends Implementation<P> {
  symbol?: string;
  constructor(
    path: P,
    { symbol, ...configArgs }: FieldConfigArgs & { symbol?: string },
    extraArgs: FieldExtraArgs
  ) {
    super(path, { symbol, ...configArgs }, extraArgs);
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
    return { [`${this.path}`]: (item: Record<P, any>) => item[this.path] };
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

export class PrismaDecimalInterface<P extends string> extends PrismaFieldAdapter<P> {
  isUnique: boolean;
  isIndexed: boolean;
  precision: null | number;
  scale: null | number;

  constructor(
    fieldName: string,
    path: P,
    field: Decimal<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => List | undefined,
    config = {}
  ) {
    super(fieldName, path, field, listAdapter, getListByKey, config);
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
    return [
      this._schemaField({
        type: 'Decimal',
        extra: `@postgresql.Decimal(${this.precision}, ${this.scale})`,
      }),
    ];
  }

  setupHooks({
    addPreSaveHook,
    addPostReadHook,
  }: {
    addPreSaveHook: (hook: any) => void;
    addPostReadHook: (hook: any) => void;
  }) {
    // Updates the relevant value in the item provided (by reference)
    addPreSaveHook((item: Record<P, any>) => {
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

    addPostReadHook((item: Record<P, any>) => {
      if (item[this.path]) {
        item[this.path] = item[this.path].toFixed(this.scale);
      }
      return item;
    });
  }

  getQueryConditions(dbPath: string) {
    return {
      ...this.equalityConditions(dbPath),
      ...this.orderingConditions(dbPath),
    };
  }
}
