const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');
const { escapeRegExp: esc } = require('@keystonejs/utils');

class Text extends Implementation {
  constructor() {
    super(...arguments);
    this.graphQLType = 'String';
  }

  getGraphqlQueryArgs() {
    return `
      ${this.path}: String
      ${this.path}_case_sensitive: Boolean
      ${this.path}_not: String
      ${this.path}_contains: String
      ${this.path}_not_contains: String
      ${this.path}_starts_with: String
      ${this.path}_not_starts_with: String
      ${this.path}_ends_with: String
      ${this.path}_not_ends_with: String
      ${this.path}_in: [String!]
      ${this.path}_not_in: [String!]
    `;
  }
  isGraphqlQueryArg(arg) {
    return (
      [
        this.path,
        `${this.path}_case_sensitive`,
        `${this.path}_not`,
        `${this.path}_contains`,
        `${this.path}_not_contains`,
        `${this.path}_starts_with`,
        `${this.path}_not_starts_with`,
        `${this.path}_ends_with`,
        `${this.path}_not_ends_with`,
        `${this.path}_in`,
        `${this.path}_not_in`,
      ].indexOf(arg) !== -1
    );
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

class MongoTextInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    schema.add({
      [this.path]: { type: String, ...mongooseOptions },
    });
  }

  getQueryConditions(args) {
    const conditions = [];
    if (!args) {
      return conditions;
    }
    const caseSensitive = args[`${this.path}_case_sensitive`];
    const rx_cs = caseSensitive ? '' : 'i';
    const eq = this.path;
    if (eq in args) {
      if (caseSensitive) {
        conditions.push({ $eq: args[eq] });
      } else {
        const eq_rx = new RegExp(`^${esc(args[eq])}$`, rx_cs);
        conditions.push({ $regex: eq_rx });
      }
    }
    const not = `${this.path}_not`;
    if (not in args) {
      if (caseSensitive) {
        conditions.push({ $ne: args[not] });
      } else {
        const not_rx = new RegExp(`^${esc(args[not])}$`, rx_cs);
        conditions.push({ $not: not_rx });
      }
    }
    const contains = `${this.path}_contains`;
    if (contains in args) {
      const contains_rx = new RegExp(esc(args[contains]), rx_cs);
      conditions.push({ $regex: contains_rx });
    }
    const not_contains = `${this.path}_not_contains`;
    if (not_contains in args) {
      const not_contains_rx = new RegExp(esc(args[not_contains]), rx_cs);
      conditions.push({ $not: not_contains_rx });
    }
    const starts_with = `${this.path}_starts_with`;
    if (starts_with in args) {
      const starts_with_rx = new RegExp(`^${esc(args[starts_with])}`, rx_cs);
      conditions.push({ $regex: starts_with_rx });
    }
    const not_starts_with = `${this.path}_not_starts_with`;
    if (not_starts_with in args) {
      const not_starts_with_rx = new RegExp(
        `^${esc(args[not_starts_with])}`,
        rx_cs
      );
      conditions.push({ $not: not_starts_with_rx });
    }
    const ends_with = `${this.path}_ends_with`;
    if (ends_with in args) {
      const ends_with_rx = new RegExp(`${esc(args[ends_with])}$`, rx_cs);
      conditions.push({ $regex: ends_with_rx });
    }
    const not_ends_with = `${this.path}_not_ends_with`;
    if (not_ends_with in args) {
      const not_ends_with_rx = new RegExp(
        `${esc(args[not_ends_with])}$`,
        rx_cs
      );
      conditions.push({ $not: not_ends_with_rx });
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
  Text,
  MongoTextInterface,
};
