const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');
const { escapeRegExp } = require('@voussoir/utils');

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
      `${this.path}_i: String`,
      `${this.path}_not: String`,
      `${this.path}_not_i: String`,
      `${this.path}_contains: String`,
      `${this.path}_contains_i: String`,
      `${this.path}_not_contains: String`,
      `${this.path}_not_contains_i: String`,
      `${this.path}_starts_with: String`,
      `${this.path}_starts_with_i: String`,
      `${this.path}_not_starts_with: String`,
      `${this.path}_not_starts_with_i: String`,
      `${this.path}_ends_with: String`,
      `${this.path}_ends_with_i: String`,
      `${this.path}_not_ends_with: String`,
      `${this.path}_not_ends_with_i: String`,
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
      [this.path]: value => ({
        [this.path]: { $eq: value },
      }),
      [`${this.path}_i`]: value => ({
        [this.path]: new RegExp(`^${escapeRegExp(value)}$`, 'i'),
      }),
      [`${this.path}_not`]: value => ({
        [this.path]: { $ne: value },
      }),
      [`${this.path}_not_i`]: value => ({
        [this.path]: { $not: new RegExp(`^${escapeRegExp(value)}$`, 'i') },
      }),

      [`${this.path}_contains`]: value => ({
        [this.path]: { $regex: new RegExp(escapeRegExp(value)) },
      }),
      [`${this.path}_contains_i`]: value => ({
        [this.path]: { $regex: new RegExp(escapeRegExp(value), 'i') },
      }),
      [`${this.path}_not_contains`]: value => ({
        [this.path]: { $not: new RegExp(escapeRegExp(value)) },
      }),
      [`${this.path}_not_contains_i`]: value => ({
        [this.path]: { $not: new RegExp(escapeRegExp(value), 'i') },
      }),

      [`${this.path}_starts_with`]: value => ({
        [this.path]: { $regex: new RegExp(`^${escapeRegExp(value)}`) },
      }),
      [`${this.path}_starts_with_i`]: value => ({
        [this.path]: { $regex: new RegExp(`^${escapeRegExp(value)}`, 'i') },
      }),
      [`${this.path}_not_starts_with`]: value => ({
        [this.path]: { $not: new RegExp(`^${escapeRegExp(value)}`) },
      }),
      [`${this.path}_not_starts_with_i`]: value => ({
        [this.path]: { $not: new RegExp(`^${escapeRegExp(value)}`, 'i') },
      }),
      [`${this.path}_ends_with`]: value => ({
        [this.path]: { $regex: new RegExp(`${escapeRegExp(value)}$`) },
      }),
      [`${this.path}_ends_with_i`]: value => ({
        [this.path]: { $regex: new RegExp(`${escapeRegExp(value)}$`, 'i') },
      }),
      [`${this.path}_not_ends_with`]: value => ({
        [this.path]: { $not: new RegExp(`${escapeRegExp(value)}$`) },
      }),
      [`${this.path}_not_ends_with_i`]: value => ({
        [this.path]: { $not: new RegExp(`${escapeRegExp(value)}$`, 'i') },
      }),

      // These have no case-insensitive counter parts
      [`${this.path}_in`]: value => ({
        [this.path]: { $in: value },
      }),
      [`${this.path}_not_in`]: value => ({
        [this.path]: { $not: { $in: value } },
      }),
    };
  }
}

module.exports = {
  Text,
  MongoTextInterface,
};
