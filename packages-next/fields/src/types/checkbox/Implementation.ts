import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { BaseKeystoneList } from '@keystone-next/types';
import { FieldConfigArgs, FieldExtraArgs, Implementation } from '../../Implementation';

export class Checkbox<P extends string> extends Implementation<P> {
  constructor(path: P, configArgs: FieldConfigArgs, extraArgs: FieldExtraArgs) {
    super(path, configArgs, extraArgs);
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return false;
  }

  gqlOutputFields() {
    return [`${this.path}: Boolean`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: (item: Record<P, any>) => item[this.path] };
  }

  gqlQueryInputFields() {
    return this.equalityInputFields('Boolean');
  }
  gqlUpdateInputFields() {
    return [`${this.path}: Boolean`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: Boolean`];
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'boolean | null' } };
  }
}

export class PrismaCheckboxInterface<P extends string> extends PrismaFieldAdapter<P> {
  constructor(
    fieldName: string,
    path: P,
    field: Checkbox<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => BaseKeystoneList | undefined,
    config = {}
  ) {
    super(fieldName, path, field, listAdapter, getListByKey, config);

    // Error rather than ignoring invalid config
    if (this.config.isIndexed) {
      throw (
        `The Checkbox field type doesn't support indexes on Prisma. ` +
        `Check the config for ${this.path} on the ${this.field.listKey} list`
      );
    }
  }
  getPrismaSchema() {
    return [this._schemaField({ type: 'Boolean' })];
  }

  getQueryConditions(dbPath: string) {
    return this.equalityConditions(dbPath);
  }
}
