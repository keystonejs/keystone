const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');

class Checkbox extends Implementation {
  constructor() {
    super(...arguments);
    this.graphQLType = 'Boolean';
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
    return conditions;
  }
}

module.exports = {
  Checkbox,
  MongoCheckboxInterface,
};
