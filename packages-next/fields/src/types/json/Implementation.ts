import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { BaseKeystoneList } from '@keystone-next/types';
import { Implementation } from '../../Implementation';
import { FieldConfigArgs, FieldExtraArgs } from '../../index';
// eslint-disable-next-line import/no-unresolved

export class Json<P extends string> extends Implementation<P> {
  constructor(path: P, configArgs: FieldConfigArgs, extraArgs: FieldExtraArgs) {
    super(path, configArgs, extraArgs);
    this.isOrderable = false;
  }

  get _supportsUnique() {
    return false;
  }

  gqlOutputFields(): string[] {
    return [`${this.path}: JSON`];
  }

  // Called on `User.avatar` for example
  gqlOutputFieldResolvers() {
    return {
      [this.path]: (item: Record<P, any>) => {
        let document = item[this.path];
        if (this.adapter.listAdapter.parentAdapter.provider === 'sqlite') {
          // we store document data as a string on sqlite because Prisma doesn't support Json on sqlite
          // https://github.com/prisma/prisma/issues/3786
          try {
            document = JSON.parse(document);
          } catch (err) {
            console.log(err);
          }
        }

        return document;
      },
    };
  }

  async resolveInput({ resolvedData }: { resolvedData: Record<P, any> }) {
    const data = resolvedData[this.path];
    if (data === null) {
      return null;
    }
    if (data === undefined) {
      return undefined;
    }
    if (this.adapter.listAdapter.parentAdapter.provider === 'sqlite') {
      // we store document data as a string on sqlite because Prisma doesn't support Json on sqlite
      // https://github.com/prisma/prisma/issues/3786
      return JSON.stringify(data);
    }
    return data;
  }

  gqlUpdateInputFields() {
    return [`${this.path}: JSON`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: JSON`];
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'any | null' } };
  }
}

export class PrismaJsonInterface<P extends string> extends PrismaFieldAdapter<P> {
  constructor(
    fieldName: string,
    path: P,
    field: Json<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => BaseKeystoneList | undefined,
    config = {}
  ) {
    super(fieldName, path, field, listAdapter, getListByKey, config);
    // Error rather than ignoring invalid config
    // We totally can index these values, it's just not trivial. See issue #1297
    if (this.config.isIndexed) {
      throw new Error(
        `The json field type doesn't support indexes on Prisma. ` +
          `Check the config for ${this.path} on the ${this.field.listKey} list`
      );
    }
  }

  getPrismaSchema() {
    return [
      this._schemaField({
        type:
          this.listAdapter.parentAdapter.provider === 'sqlite'
            ? // we store document data as a string on sqlite because Prisma doesn't support Json on sqlite
              // https://github.com/prisma/prisma/issues/3786
              'String'
            : 'Json',
      }),
    ];
  }

  getQueryConditions() {
    return {};
  }

  setupHooks({
    addPreSaveHook,
    addPostReadHook,
  }: {
    addPreSaveHook: (hook: any) => void;
    addPostReadHook: (hook: any) => void;
  }) {
    addPreSaveHook((item: Record<P, any>) => {
      console.log('addPreSaveHook', item);
      return item;
    });

    addPostReadHook((item: Record<P, any>) => {
      console.log('addPostReadHook', item);
      return item;
    });
  }
}
