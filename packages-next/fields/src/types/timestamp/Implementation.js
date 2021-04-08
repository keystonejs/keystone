import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Implementation } from '@keystone-next/fields-legacy';

export class DateTimeUtcImplementation extends Implementation {
  constructor(path, { format = 'yyyy-MM-dd[T]HH:mm:ss.SSSxx' }) {
    super(...arguments);
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
    return { [`${this.path}`]: item => item[this.path] && item[this.path].toISOString() };
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

export class PrismaDateTimeUtcInterface extends PrismaFieldAdapter {
  constructor() {
    super(...arguments);
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }

  getPrismaSchema() {
    return [this._schemaField({ type: 'DateTime' })];
  }

  _stringToDate(s) {
    return s && new Date(s);
  }

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath, this._stringToDate),
      ...this.orderingConditions(dbPath, this._stringToDate),
      ...this.inConditions(dbPath, this._stringToDate),
    };
  }

  setupHooks({ addPreSaveHook }) {
    addPreSaveHook(item => {
      if (item[this.path]) {
        item[this.path] = this._stringToDate(item[this.path]);
      }
      return item;
    });
  }
}
