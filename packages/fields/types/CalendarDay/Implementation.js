const parse = require('date-fns/parse');
const format = require('date-fns/format');
const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');

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

class MongoCalendarDayInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions = {} } = this.config;
    const { required } = mongooseOptions;

    const validator = a => typeof a === 'string' && format(parse(a), 'YYYY-MM-DD') === a;
    const schemaOptions = {
      type: String,
      validate: {
        validator: this.buildValidator(validator, required),
        message: '{VALUE} is not an ISO8601 date string (YYYY-MM-DD)',
      },
    };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }

  getQueryConditions() {
    return {
      ...this.equalityConditions(),
      ...this.orderingConditions(),
      ...this.inConditions(),
    };
  }
}

module.exports = {
  CalendarDay,
  MongoCalendarDayInterface,
};
