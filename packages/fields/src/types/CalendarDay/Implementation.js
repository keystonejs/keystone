import { formatISO, parseISO, compareAsc, compareDesc, isValid } from 'date-fns';
import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';

export class CalendarDay extends Implementation {
  constructor(path, { format = 'yyyy-MM-dd', dateFrom, dateTo }) {
    super(...arguments);
    this.format = format;
    this._dateFromString = dateFrom;
    this._dateToString = dateTo;
    this._dateFromJS = dateFrom && parseISO(dateFrom);
    this._dateToJS = dateTo && parseISO(dateTo);

    if (dateFrom && !isValid(this._dateFromJS)) {
      throw new Error(
        `Invalid value for option "dateFrom" of field '${this.listKey}.${path}': "${dateFrom}"`
      );
    }
    if (dateTo && !isValid(this._dateToJS)) {
      throw new Error(
        `Invalid value for option "dateTo" of field '${this.listKey}.${path}': "${dateTo}"`
      );
    }

    if (dateTo && dateFrom && compareAsc(this._dateFromJS, this._dateToJS) === 1) {
      throw new Error(
        `Invalid values for options "dateFrom", "dateTo" of field '${this.listKey}.${path}': "${dateFrom}" > "${dateTo}"`
      );
    }
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
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
    };
  }

  async validateInput({ resolvedData, addFieldValidationError }) {
    const parsedValue = resolvedData[this.path] && parseISO(resolvedData[this.path]);
    if (!isValid(parsedValue)) {
      addFieldValidationError('Invalid CalendarDay value', { value: resolvedData[this.path] });
    }
    if (parsedValue) {
      if (this._dateFromJS && compareAsc(this._dateFromJS, parsedValue) === 1) {
        addFieldValidationError('Value is before earliest allowed date.', {
          value: resolvedData[this.path],
          dateFrom: this._dateFromString,
        });
      }
      if (this._dateToJS && compareDesc(this._dateToJS, parsedValue) === 1) {
        addFieldValidationError('Value is after latest allowed date.', {
          value: resolvedData[this.path],
          dateTo: this._dateToString,
        });
      }
    }
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
