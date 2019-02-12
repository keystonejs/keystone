const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');
const { KnexFieldAdapter } = require('@voussoir/adapter-knex');

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
      ...this.equalityInputFields('String'),
      ...this.stringInputFields('String'),
      ...this.equalityInputFieldsInsensitive('String'),
      ...this.stringInputFieldsInsensitive('String'),
      ...this.inInputFields('String'),
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
    schema.add({ [this.path]: this.mergeSchemaOptions({ type: String }, this.config) });
  }

  getQueryConditions() {
    return {
      ...this.equalityConditions(),
      ...this.stringConditions(),
      ...this.equalityConditionsInsensitive(),
      ...this.stringConditionsInsensitive(),
      // These have no case-insensitive counter parts
      ...this.inConditions(),
    };
  }
}

class KnexTextInterface extends KnexFieldAdapter {
  createColumn(table) {
    table.text(this.path);
  }
  getQueryConditions(f, g) {
    return {
      ...this.equalityConditions(f, g),
      ...this.stringConditions(f, g),
      ...this.equalityConditionsInsensitive(f, g),
      ...this.stringConditionsInsensitive(f, g),
      ...this.inConditions(f, g),
    };
  }
}

module.exports = {
  Text,
  MongoTextInterface,
  KnexTextInterface,
};
