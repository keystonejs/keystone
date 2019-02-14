const parse = require('date-fns/parse');
const format = require('date-fns/format');
const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');
const { KnexFieldAdapter } = require('@voussoir/adapter-knex');

class CalendarDay extends Implementation {
  constructor() {
    super(...arguments);
  }

  get gqlOutputFields() {
    return [`${this.path}: String`];
  }
  get gqlQueryInputFields() {
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
      format: this.config.format,
      yearRangeFrom: this.config.yearRangeFrom,
      yearRangeTo: this.config.yearRangeTo,
      yearPickerType: this.config.yearPickerType,
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

class MongoCalendarDayInterface extends CommonCalendarInterface(MongooseFieldAdapter) {
  addToMongooseSchema(schema) {
    const { mongooseOptions = {} } = this.config;
    const { isRequired } = mongooseOptions;

    const validator = a => typeof a === 'string' && format(parse(a), 'YYYY-MM-DD') === a;
    const schemaOptions = {
      type: String,
      validate: {
        validator: this.buildValidator(validator, isRequired),
        message: '{VALUE} is not an ISO8601 date string (YYYY-MM-DD)',
      },
    };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }
}

class KnexCalendarDayInterface extends CommonCalendarInterface(KnexFieldAdapter) {
  createColumn(table) {
    table.text(this.path);
  }
}

module.exports = {
  CalendarDay,
  MongoCalendarDayInterface,
  KnexCalendarDayInterface,
};
