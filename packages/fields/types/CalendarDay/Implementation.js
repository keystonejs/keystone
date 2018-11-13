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
    const { mongooseOptions } = this.config;
    const required = mongooseOptions && mongooseOptions.required;

    const isValidDate = s => format(parse(s), 'YYYY-MM-DD') === s;

    schema.add({
      [this.path]: {
        type: String,
        validate: {
          validator: required
            ? isValidDate
            : a => {
                if (typeof a === 'string' && isValidDate(a)) return true;
                if (typeof a === 'undefined' || a === null) return true;
                return false;
              },
          message: '{VALUE} is not an ISO8601 date string (YYYY-MM-DD)',
        },
        ...mongooseOptions,
      },
    });
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
