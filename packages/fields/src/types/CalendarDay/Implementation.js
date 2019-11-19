import { format, parseISO, isValid, isWithinInterval } from 'date-fns';
import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';

const DEFAULT_FORMAT = 'yyyy-MM-dd';

const parseDateRangeConfig = (dateInput, keyName) => {
  if (typeof dateInput === 'string') {
    const parsedString = parseISO(dateInput);

    if (!isValid(parsedString)) {
      throw new Error(`Invalid date. '${keyName}' string values must be in ISO8601 format`);
    }

    return parsedString;
  }

  if (dateInput instanceof Date) {
    if (!isValid(dateInput)) {
      throw new Error(`Invalid date value for '${keyName}'`);
    }

    return dateInput;
  }

  throw new Error(`'${keyName}' must be either a Date object or an ISO8601 string`);
};

export class CalendarDay extends Implementation {
  constructor(path, { format, dateRangeFrom, dateRangeTo }) {
    super(...arguments);
    this.format = format;
    this.dateRangeFrom = parseDateRangeConfig(dateRangeFrom, 'dateRangeFrom');
    this.dateRangeTo = parseDateRangeConfig(dateRangeTo, 'dateRangeTo');
  }

  gqlOutputFields() {
    return [`${this.path}: String`];
  }

  gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('String'),
      ...this.orderingInputFields('String'),
      ...this.inInputFields('String'),
    ];
  }

  get gqlUpdateInputFields() {
    return [`${this.path}: String`];
  }

  get gqlCreateInputFields() {
    return [`${this.path}: String`];
  }

  extendAdminMeta(meta) {
    return {
      ...meta,
      format: this.format,
      dateRangeFrom: this.dateRangeFrom,
      dateRangeTo: this.dateRangeTo,
    };
  }
}

const CommonCalendarInterface = superclass =>
  class extends superclass {
    getQueryConditions(dbPath) {
      return {
        ...this.equalityConditions(dbPath),
        ...this.orderingConditions(dbPath),
        ...this.inConditions(dbPath),
      };
    }
  };

export class MongoCalendarDayInterface extends CommonCalendarInterface(MongooseFieldAdapter) {
  addToMongooseSchema(schema) {
    const validator = a => typeof a === 'string' && format(parseISO(a), DEFAULT_FORMAT) === a;
    const schemaOptions = {
      type: String,
      validate: {
        validator: this.buildValidator(validator),
        message: `{VALUE} is not an ISO8601 date string (${DEFAULT_FORMAT})`,
      },
    };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }
}

export class KnexCalendarDayInterface extends CommonCalendarInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }

  addToTableSchema(table) {
    const column = table.date(this.path);
    if (this.isUnique) column.unique();
    else if (this.isIndexed) column.index();
    if (this.isNotNullable) column.notNullable();
    if (this.defaultTo) column.defaultTo(this.defaultTo);
  }

  setupHooks({ addPostReadHook }) {
    addPostReadHook(item => {
      if (item[this.path]) {
        item[this.path] = format(parseISO(item[this.path]), DEFAULT_FORMAT);
      }
      return item;
    });
  }
}
