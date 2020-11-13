import { DateTime } from 'luxon';
import { Implementation } from '../../Implementation';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';
import { PrismaFieldAdapter } from '@keystonejs/adapter-prisma';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';

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

  extendAdminMeta(meta) {
    return { ...meta, format: this.format };
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'Date | null' } };
  }
}

// All values must have an offset
const toDate = str => {
  if (str === null) {
    return null;
  }
  if (!str.match(/([zZ]|[\+\-][0-9]+(\:[0-9]+)?)$/)) {
    throw `Value supplied (${str}) is not a valid date time with offset.`;
  }
  return DateTime.fromISO(str).toJSDate();
};

export class MongoDateTimeUtcInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    schema.add({ [this.path]: this.mergeSchemaOptions({ type: Date }, this.config) });
  }
  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath, toDate),
      ...this.orderingConditions(dbPath, toDate),
      ...this.inConditions(dbPath, toDate),
    };
  }
}

export class KnexDateTimeUtcInterface extends KnexFieldAdapter {
  constructor() {
    super(...arguments);
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }
  addToTableSchema(table) {
    // It's important we don't exceed the precision of native Date
    // objects (ms) or JS will silently round values down.
    const column = table.timestamp(this.path, { useTz: true, precision: 3 });

    if (this.isUnique) column.unique();
    else if (this.isIndexed) column.index();
    if (this.isNotNullable) column.notNullable();
    if (this.defaultTo) column.defaultTo(this.defaultTo);
  }
  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath, toDate),
      ...this.orderingConditions(dbPath, toDate),
      ...this.inConditions(dbPath, toDate),
    };
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
