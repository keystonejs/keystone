import { formatISO, parseISO, compareAsc, compareDesc, isValid } from 'date-fns';
import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';
import { PrismaFieldAdapter } from '@keystonejs/adapter-prisma';

export class CalendarDay extends Implementation {
  constructor(path, { format = 'yyyy-MM-dd', dateFrom, dateTo }) {
    super(...arguments);
    this.format = format;
    this._dateFrom = dateFrom;
    this._dateTo = dateTo;

    if (this._dateFrom && (this._dateFrom.length !== 10 || !isValid(parseISO(this._dateFrom)))) {
      throw new Error(
        `Invalid value for option "dateFrom" of field '${this.listKey}.${path}': "${this._dateFrom}"`
      );
    }

    if (this._dateTo && (this._dateTo.length !== 10 || !isValid(parseISO(this._dateTo)))) {
      throw new Error(
        `Invalid value for option "dateTo" of field '${this.listKey}.${path}': "${this._dateFrom}"`
      );
    }

    if (
      this._dateTo &&
      this._dateFrom &&
      compareAsc(parseISO(this._dateFrom), parseISO(this._dateTo)) === 1
    ) {
      throw new Error(
        `Invalid values for options "dateFrom", "dateTo" of field '${this.listKey}.${path}': "${dateFrom}" > "${dateTo}"`
      );
    }
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: String`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
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

  extendAdminMeta(meta) {
    return {
      ...meta,
      format: this.format,
      dateFrom: this._dateFrom,
      dateTo: this._dateTo,
    };
  }

  async validateInput({ resolvedData, addFieldValidationError }) {
    const initialValue = resolvedData[this.path];

    // Allow passing in the `null` value to the CalendarDay field type
    if (initialValue === null) return true;

    const parsedValue = parseISO(resolvedData[this.path]);

    if (!(initialValue.length === 10 && isValid(parsedValue))) {
      addFieldValidationError('Invalid CalendarDay value.', { value: resolvedData[this.path] });
    }
    if (parsedValue) {
      if (parseISO(this._dateFrom) && compareAsc(parseISO(this._dateFrom), parsedValue) === 1) {
        addFieldValidationError(`Value is before earliest allowed date: ${this._dateFromString}.`, {
          value: resolvedData[this.path],
          dateFrom: this._dateFromString,
        });
      }
      if (parseISO(this._dateTo) && compareDesc(parseISO(this._dateTo), parsedValue) === 1) {
        addFieldValidationError(`Value is after latest allowed date: ${this._dateToString}.`, {
          value: resolvedData[this.path],
          dateTo: this._dateToString,
        });
      }
    }
  }

  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'string | null' } };
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
    const validator = a => typeof a === 'string' && a.length === 10 && parseISO(a);
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

export class PrismaCalendarDayInterface extends CommonCalendarInterface(PrismaFieldAdapter) {
  constructor() {
    super(...arguments);
  }

  getPrismaSchema() {
    return [this._schemaField({ type: 'DateTime' })];
  }

  _stringToDate(s) {
    return s && new Date(s + 'T00:00:00+0000');
  }

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath, this._stringToDate),
      ...this.orderingConditions(dbPath, this._stringToDate),
      ...this.inConditions(dbPath, this._stringToDate),
    };
  }

  setupHooks({ addPreSaveHook, addPostReadHook }) {
    addPreSaveHook(item => {
      if (item[this.path]) {
        item[this.path] = this._stringToDate(item[this.path]);
      }
      return item;
    });

    addPostReadHook(item => {
      if (item[this.path]) {
        item[this.path] = formatISO(item[this.path], { representation: 'date' });
      }
      return item;
    });
  }
}
