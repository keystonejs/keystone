import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { BaseKeystoneList } from '@keystone-next/types';
import { FieldConfigArgs, FieldExtraArgs, Implementation } from '../../Implementation';

export class MongoIdImplementation<P extends string> extends Implementation<P> {
  gqlType: 'ID' | 'String';
  constructor(
    path: P,
    {
      gqlType,
      isUnique = true,
      access = {},
      ...configArgs
    }: FieldConfigArgs & { gqlType: 'ID' | 'String'; isUnique: boolean },
    extraArgs: FieldExtraArgs
  ) {
    // Apply some field type defaults before we hand off to super; see README.md
    if (typeof access === 'object') {
      access = { create: false, update: false, delete: false, ...access };
    }

    // The base implementation takes care of everything else
    super(path, { gqlType, isUnique, access, ...configArgs }, extraArgs);

    // If no valid gqlType is supplied, default based on whether or not we're the primary key
    this.gqlType = ['ID', 'String'].includes(gqlType) ? gqlType : this.isPrimaryKey ? 'ID' : 'String';
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: ${this.gqlType}${this.isPrimaryKey ? '!' : ''}`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: (item: Record<P, any>) => item[this.path] };
  }
  gqlQueryInputFields() {
    return [
      ...this.equalityInputFields(this.gqlType),
      ...this.orderingInputFields(this.gqlType),
      ...this.inInputFields(this.gqlType),
    ];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: ${this.gqlType}`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: ${this.gqlType}`];
  }

  getBackingTypes() {
    if (this.path === 'id') {
      return { [this.path]: { optional: false, type: 'string' } };
    }
    return { [this.path]: { optional: true, type: 'string | null' } };
  }
}

export class PrismaMongoIdInterface<P extends string> extends PrismaFieldAdapter<P> {
  isUnique: boolean;
  isIndexed: boolean;
  constructor(
    fieldName: string,
    path: P,
    field: MongoIdImplementation<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => BaseKeystoneList | undefined,
    config = {}
  ) {
    super(fieldName, path, field, listAdapter, getListByKey, config);
    if (this.listAdapter.parentAdapter.provider === 'sqlite' && !this.field.isPrimaryKey) {
      throw new Error(
        `PrismaAdapter provider "sqlite" does not support field type "${this.field.constructor.name}"`
      );
    }
    // Default isUnique to true if not specified
    this.isUnique = typeof this.config.isUnique === 'undefined' ? true : !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }

  getPrismaSchema() {
    return [this._schemaField({ type: 'String', extra: '@default(dbgenerated()) @map("_id") @mongodb.ObjectId' })];
  }

  gqlToPrisma(value: any) {
    // If we're an ID type then we'll be getting strings from GQL
    return String(value);
    // console.log(this.field.gqlType);
    // return this.field.gqlType === 'ID' ? Number(value) : value;
  }

  equalityConditions<T>(dbPath: string, f: (a: any) => any) {
    return {
      [this.path]: (value: T) => ({ [dbPath]: f(value) }),
      [`${this.path}_not`]: (value: T) => ({ NOT: { [this.path]: f(value) } }),
    };
  }

  inConditions<T>(dbPath: string, f: (a: any) => any) {
    return {
      [`${this.path}_in`]: (value: (T | null)[]) =>
        value.includes(null)
          ? { [dbPath]: { in: f(value.filter(x => x !== null)) } }
          : { [dbPath]: { in: f(value) } },
      [`${this.path}_not_in`]: (value: (T | null)[]) =>
        value.includes(null)
          ? { AND: [{ NOT: { [dbPath]: { in: f(value.filter(x => x !== null)) } } }] }
          : { NOT: { [dbPath]: { in: f(value) } } },
    };
  }

  getQueryConditions(dbPath: string) {
    return {
      ...this.equalityConditions(dbPath, x => String(x) || -1),
      ...this.orderingConditions(dbPath, x => String(x) || -1),
      ...this.inConditions(dbPath, x => x.map((xx: any) => String(xx) || -1)),
    };
  }
}
