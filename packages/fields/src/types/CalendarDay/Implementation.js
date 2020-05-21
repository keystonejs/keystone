import { formatISO, parseISO } from 'date-fns';
import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';

export class CalendarDay extends Implementation {
  constructor(
    path,
    {
      format = 'yyyy-MM-dd',
      yearRangeFrom = new Date().getFullYear() - 100,
      yearRangeTo = new Date().getFullYear(),
    }
  ) {
    super(...arguments);
    this.format = format;
    this.yearRangeFrom = yearRangeFrom;
    this.yearRangeTo = yearRangeTo;
    this.isOrderable = true;
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
      yearRangeFrom: this.yearRangeFrom,
      yearRangeTo: this.yearRangeTo,
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
    const validator = a =>
      typeof a === 'string' && formatISO(parseISO(a), { representation: 'date' }) === a;
    const schemaOptions = {
      type: String,
      validate: {
        validator: this.buildValidator(validator),
        message: '{VALUE} is not an ISO8601 date string (yyyy-MM-dd)',
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
        item[this.path] = formatISO(item[this.path], { representation: 'date' });
      }
      return item;
    });
  }
}
