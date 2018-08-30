const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');
const { escapeRegExp: esc } = require('@keystonejs/utils');

class Text extends Implementation {
  constructor() {
    super(...arguments);
  }

  getGraphqlOutputFields() {
    return [{ name: this.path, type: `String` }];
  }
  getGraphqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  getGraphqlQueryArgs() {
    return [
      { name: this.path, type: 'String' },
      { name: `${this.path}_case_sensitive`, type: 'Boolean' },
      { name: `${this.path}_not`, type: 'String' },
      { name: `${this.path}_contains`, type: 'String' },
      { name: `${this.path}_not_contains`, type: 'String' },
      { name: `${this.path}_starts_with`, type: 'String' },
      { name: `${this.path}_not_starts_with`, type: 'String' },
      { name: `${this.path}_ends_with`, type: 'String' },
      { name: `${this.path}_not_ends_with`, type: 'String' },
      { name: `${this.path}_in`, type: '[String!]' },
      { name: `${this.path}_not_in`, type: '[String!]' },
    ];
  }
  getGraphqlUpdateArgs() {
    return [{ name: this.path, type: 'String' }];
  }
  getGraphqlCreateArgs() {
    return [{ name: this.path, type: 'String' }];
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
