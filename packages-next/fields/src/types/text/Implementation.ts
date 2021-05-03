import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { FieldConfigArgs, FieldExtraArgs, Implementation } from '../../Implementation';

export class Text<P extends string> extends Implementation<P> {
  constructor(path: P, configArgs: FieldConfigArgs, extraArgs: FieldExtraArgs) {
    super(path, configArgs, extraArgs);
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
    const { listAdapter } = this.adapter;
    return [
      ...this.equalityInputFields('String'),
      ...(listAdapter.parentAdapter.provider === 'sqlite'
        ? this.containsInputFields('String')
        : [
            ...this.stringInputFields('String'),
            ...this.equalityInputFieldsInsensitive('String'),
            ...this.stringInputFieldsInsensitive('String'),
          ]),
      ...this.inInputFields('String'),
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

export class PrismaTextInterface<P extends string> extends PrismaFieldAdapter<P> {
  isUnique: boolean;
  isIndexed: boolean;
  constructor(
    fieldName: string,
    path: P,
    field: Text<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => BaseKeystoneList | undefined,
    config = {}
  ) {
    super(fieldName, path, field, listAdapter, getListByKey, config);
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }

  getPrismaSchema() {
    return [this._schemaField({ type: 'String' })];
  }

  getQueryConditions(dbPath: string) {
    const { listAdapter } = this;
    return {
      ...this.equalityConditions(dbPath),
      ...(listAdapter.parentAdapter.provider === 'sqlite'
        ? this.containsConditions(dbPath)
        : {
            ...this.stringConditions(dbPath),
            ...this.equalityConditionsInsensitive(dbPath),
            ...this.stringConditionsInsensitive(dbPath),
          }),
      // These have no case-insensitive counter parts
      ...this.inConditions(dbPath),
    };
  }
}
