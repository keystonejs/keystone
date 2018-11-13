const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');

class Checkbox extends Implementation {
  constructor() {
    super(...arguments);
  }

  get gqlOutputFields() {
    return [`${this.path}: Boolean`];
  }
  get gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  get gqlQueryInputFields() {
    return this.equalityInputFields('Boolean');
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: Boolean`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: Boolean`];
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
    return this.equalityConditions();
  }
}

module.exports = {
  Checkbox,
  MongoCheckboxInterface,
};
