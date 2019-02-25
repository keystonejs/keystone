const { Implementation } = require('@voussoir/field');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');
const { KnexFieldAdapter } = require('@voussoir/adapter-knex');

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

const CommonCheckboxInterface = superclass =>
  class extends superclass {
    getQueryConditions(dbPath) {
      return this.equalityConditions(dbPath);
    }
  };

class MongoCheckboxInterface extends CommonCheckboxInterface(MongooseFieldAdapter) {
  addToMongooseSchema(schema) {
    schema.add({ [this.path]: this.mergeSchemaOptions({ type: Boolean }, this.config) });
  }
}

class KnexCheckboxInterface extends CommonCheckboxInterface(KnexFieldAdapter) {
  createColumn(table) {
    return table.boolean(this.path);
  }
}

module.exports = {
  Checkbox,
  MongoCheckboxInterface,
  KnexCheckboxInterface,
};
