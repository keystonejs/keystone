const parse = require('date-fns/parse');
const format = require('date-fns/format');
const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');

class CalendarDay extends Implementation {
  constructor() {
    super(...arguments);
  }

  getGraphqlOutputFields() {
    return [{ name: this.path, type: 'String' }];
  }
  getGraphqlQueryArgs() {
    return [
      { name: this.path, type: 'String' },
      { name: `${this.path}_not`, type: 'String' },
      { name: `${this.path}_lt`, type: 'String' },
      { name: `${this.path}_lte`, type: 'String' },
      { name: `${this.path}_gt`, type: 'String' },
      { name: `${this.path}_gte`, type: 'String' },
      { name: `${this.path}_in`, type: '[String]' },
      { name: `${this.path}_not_in`, type: '[String]' },
    ];
  }
  getGraphqlUpdateArgs() {
    return [{ name: this.path, type: 'String' }];
  }
  getGraphqlCreateArgs() {
    return [{ name: this.path, type: 'String' }];
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
      [this.path]: value => ({ [this.path]: { $eq: value } }),
      [`${this.path}_not`]: value => ({ [this.path]: { $ne: value } }),
      [`${this.path}_lt`]: value => ({ [this.path]: { $lt: value } }),
      [`${this.path}_lte`]: value => ({ [this.path]: { $lte: value } }),
      [`${this.path}_gt`]: value => ({ [this.path]: { $gt: value } }),
      [`${this.path}_gte`]: value => ({ [this.path]: { $gte: value } }),
      [`${this.path}_in`]: value => ({ [this.path]: { $in: value } }),
      [`${this.path}_not_in`]: value => ({ [this.path]: { $not: { $in: value } } }),
    };
  }
}

module.exports = {
  CalendarDay,
  MongoCalendarDayInterface,
};
