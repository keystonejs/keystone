const parse = require('date-fns/parse');
const format = require('date-fns/format');
const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');

class CalendarDay extends Implementation {
  constructor() {
    super(...arguments);
  }

  getGraphqlOutputFields() {
    return `
      ${this.path}: String
    `;
  }
  getGraphqlQueryArgs() {
    return `
        ${this.path}: String
        ${this.path}_not: String
        ${this.path}_lt: String
        ${this.path}_lte: String
        ${this.path}_gt: String
        ${this.path}_gte: String
        ${this.path}_in: [String]
        ${this.path}_not_in: [String]
    `;
  }
  getGraphqlUpdateArgs() {
    return `
      ${this.path}: String
    `;
  }
  getGraphqlCreateArgs() {
    return `
      ${this.path}: String
    `;
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

  getQueryConditions(args) {
    const conditions = [];
    if (!args) {
      return conditions;
    }

    const eq = this.path;
    if (eq in args) {
      conditions.push({ $eq: args[eq] });
    }
    const not = `${this.path}_not`;
    if (not in args) {
      conditions.push({ $ne: args[not] });
    }
    const lt = `${this.path}_lt`;
    if (lt in args) {
      conditions.push({ $lt: args[lt] });
    }
    const lte = `${this.path}_lte`;
    if (lte in args) {
      conditions.push({ $lte: args[lte] });
    }
    const gt = `${this.path}_gt`;
    if (gt in args) {
      conditions.push({ $gt: args[gt] });
    }
    const gte = `${this.path}_gte`;
    if (gte in args) {
      conditions.push({ $gte: args[gte] });
    }
    const is_in = `${this.path}_in`;
    if (is_in in args) {
      conditions.push({ $in: args[is_in] });
    }
    const not_in = `${this.path}_not_in`;
    if (not_in in args) {
      conditions.push({ $not: { $in: args[not_in] } });
    }
    return conditions;
  }
}

module.exports = {
  CalendarDay,
  MongoCalendarDayInterface,
};
