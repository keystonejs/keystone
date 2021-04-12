import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { FieldConfigArgs, FieldExtraArgs, Implementation } from '../../Implementation';

type List = { adapter: PrismaListAdapter };

export class Float<P extends string> extends Implementation<P> {
  constructor(path: P, configArgs: FieldConfigArgs, extraArgs: FieldExtraArgs) {
    super(path, configArgs, extraArgs);
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: Float`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: (item: Record<P, any>) => item[this.path] };
  }

  gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('Float'),
      ...this.orderingInputFields('Float'),
      ...this.inInputFields('Float'),
    ];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: Float`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: Float`];
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'number | null' } };
  }
}

export class PrismaFloatInterface<P extends string> extends PrismaFieldAdapter<P> {
  constructor(
    fieldName: string,
    path: P,
    field: Float<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => List | undefined,
    config = {}
  ) {
    super(fieldName, path, field, listAdapter, getListByKey, config);
  }

  getPrismaSchema() {
    return [this._schemaField({ type: 'Float' })];
  }

  getQueryConditions(dbPath: string) {
    return {
      ...this.equalityConditions(dbPath),
      ...this.orderingConditions(dbPath),
      ...this.inConditions(dbPath),
    };
  }
}
