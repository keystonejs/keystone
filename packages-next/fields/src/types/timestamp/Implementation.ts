import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { FieldConfigArgs, FieldExtraArgs, Implementation } from '../../Implementation';

type List = { adapter: PrismaListAdapter };

export class DateTimeUtcImplementation<P extends string> extends Implementation<P> {
  format: string;

  constructor(
    path: P,
    {
      format = 'yyyy-MM-dd[T]HH:mm:ss.SSSxx',
      ...configArgs
    }: FieldConfigArgs & { format?: string },
    extraArgs: FieldExtraArgs
  ) {
    super(path, { format, ...configArgs }, extraArgs);
    this.isOrderable = true;
    this.format = format;
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: String`];
  }
  gqlOutputFieldResolvers() {
    return {
      [`${this.path}`]: (item: Record<P, any>) => item[this.path] && item[this.path].toISOString(),
    };
  }
  gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('String'),
      ...this.orderingInputFields('String'),
      ...this.inInputFields('String'),
    ];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: String`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: String`];
  }
  getGqlAuxTypes() {
    return [`scalar String`];
  }

  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'Date | null' } };
  }
}

export class PrismaDateTimeUtcInterface<P extends string> extends PrismaFieldAdapter<P> {
  isUnique: boolean;
  isIndexed: boolean;
  constructor(
    fieldName: string,
    path: P,
    field: DateTimeUtcImplementation<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => List | undefined,
    config = {}
  ) {
    super(fieldName, path, field, listAdapter, getListByKey, config);
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }

  getPrismaSchema() {
    return [this._schemaField({ type: 'DateTime' })];
  }

  _stringToDate(s?: string) {
    return s && new Date(s);
  }

  getQueryConditions(dbPath: string) {
    return {
      ...this.equalityConditions(dbPath, this._stringToDate),
      ...this.orderingConditions(dbPath, this._stringToDate),
      ...this.inConditions(dbPath, this._stringToDate),
    };
  }

  setupHooks({ addPreSaveHook }: { addPreSaveHook: (hook: any) => void }) {
    addPreSaveHook((item: Record<P, any>) => {
      if (item[this.path]) {
        item[this.path] = this._stringToDate(item[this.path]);
      }
      return item;
    });
  }
}
