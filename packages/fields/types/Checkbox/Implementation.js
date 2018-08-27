const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');

class Checkbox extends Implementation {
  constructor() {
    super(...arguments);
  }

  getGraphqlOutputFields() {
    return `
      ${this.path}: Boolean
    `;
  }
  getGraphqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  getGraphqlQueryArgs() {
    return `
      ${this.path}: Boolean
      ${this.path}_not: Boolean
    `;
  }
  getGraphqlUpdateArgs() {
    return `
      ${this.path}: Boolean
    `;
  }
  getGraphqlCreateArgs() {
    return `
      ${this.path}: Boolean
    `;
  }
}

class MongoCheckboxInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    schema.add({
      [this.path]: { type: Boolean, ...mongooseOptions },
    });
  }

  getQueryConditions() {
    return {
      [this.path]: value => ({ [this.path]: { $eq: value } }),
      [`${this.path}_not`]: value => ({ [this.path]: { $ne: value } }),
    };
  }
}

module.exports = {
  Checkbox,
  MongoCheckboxInterface,
};
