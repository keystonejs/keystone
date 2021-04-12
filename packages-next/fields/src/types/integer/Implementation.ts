import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { FieldConfigArgs, FieldExtraArgs, Implementation } from '../../Implementation';

type List = { adapter: PrismaListAdapter };

export class Integer<P extends string> extends Implementation<P> {
  constructor(path: P, configArgs: FieldConfigArgs, extraArgs: FieldExtraArgs) {
    super(path, configArgs, extraArgs);
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: Int`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: (item: Record<P, any>) => item[this.path] };
  }

  gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('Int'),
      ...this.orderingInputFields('Int'),
      ...this.inInputFields('Int'),
    ];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: Int`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: Int`];
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'number | null' } };
  }
}

export class PrismaIntegerInterface<P extends string> extends PrismaFieldAdapter<P> {
  constructor(
    fieldName: string,
    path: P,
    field: Integer<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => List | undefined,
    config = {}
  ) {
    super(fieldName, path, field, listAdapter, getListByKey, config);
  }

  getPrismaSchema() {
    return [this._schemaField({ type: 'Int' })];
  }

  getQueryConditions(dbPath: string) {
    return {
      ...this.equalityConditions(dbPath),
      ...this.orderingConditions(dbPath),
      ...this.inConditions(dbPath),
    };
  }
}
