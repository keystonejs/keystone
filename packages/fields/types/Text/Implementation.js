const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');
const { escapeRegExp: esc } = require('@voussoir/utils');

class Text extends Implementation {
  constructor() {
    super(...arguments);
  }

  get gqlOutputFields() {
    return [`${this.path}: String`];
  }
  get gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  get gqlQueryInputFields() {
    return [
      `${this.path}: String`,
      `${this.path}_case_sensitive: Boolean`,
      `${this.path}_not: String`,
      `${this.path}_contains: String`,
      `${this.path}_not_contains: String`,
      `${this.path}_starts_with: String`,
      `${this.path}_not_starts_with: String`,
      `${this.path}_ends_with: String`,
      `${this.path}_not_ends_with: String`,
      `${this.path}_in: [String!]`,
      `${this.path}_not_in: [String!]`,
    ];
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: String`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: String`];
  }
}

class MongoTextInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    schema.add({
      [this.path]: { type: String, ...mongooseOptions },
    });
  }

  getQueryConditions() {
    return {
      [this.path]: (value, query) => {
        if (query[`${this.path}_case_sensitive`]) {
          return { [this.path]: { $eq: value } };
        }
        return { [this.path]: { $regex: new RegExp(`^${esc(value)}$`, 'i') } };
      },
      [`${this.path}_not`]: (value, query) => {
        if (query[`${this.path}_case_sensitive`]) {
          return { [this.path]: { $ne: value } };
        }
        return { [this.path]: { $not: new RegExp(`^${esc(value)}$`, 'i') } };
      },
      [`${this.path}_contains`]: (value, query) => ({
        [this.path]: {
          $regex: new RegExp(esc(value), query[`${this.path}_case_sensitive`] ? '' : 'i'),
        },
      }),
      [`${this.path}_not_contains`]: (value, query) => ({
        [this.path]: {
          $not: new RegExp(esc(value), query[`${this.path}_case_sensitive`] ? '' : 'i'),
        },
      }),
      [`${this.path}_starts_with`]: (value, query) => ({
        [this.path]: {
          $regex: new RegExp(`^${esc(value)}`, query[`${this.path}_case_sensitive`] ? '' : 'i'),
        },
      }),
      [`${this.path}_not_starts_with`]: (value, query) => ({
        [this.path]: {
          $not: new RegExp(`^${esc(value)}`, query[`${this.path}_case_sensitive`] ? '' : 'i'),
        },
      }),
      [`${this.path}_ends_with`]: (value, query) => ({
        [this.path]: {
          $regex: new RegExp(`${esc(value)}$`, query[`${this.path}_case_sensitive`] ? '' : 'i'),
        },
      }),
      [`${this.path}_not_ends_with`]: (value, query) => ({
        [this.path]: {
          $not: new RegExp(`${esc(value)}$`, query[`${this.path}_case_sensitive`] ? '' : 'i'),
        },
      }),
      [`${this.path}_in`]: value => ({ [this.path]: { $in: value } }),
      [`${this.path}_not_in`]: value => ({ [this.path]: { $not: { $in: value } } }),
    };
  }
}

module.exports = {
  Text,
  MongoTextInterface,
};
