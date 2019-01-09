const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');
const { KnexFieldAdapter } = require('@voussoir/adapter-knex');

class Float extends Implementation {
  constructor() {
    super(...arguments);
  }

  get gqlOutputFields() {
    return [`${this.path}: Float`];
  }
  get gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  get gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('Float'),
      ...this.orderingInputFields('Float'),
      ...this.inInputFields('Float'),
    ];
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: Float`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: Float`];
  }
}

class MongoFloatInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    schema.add({ [this.path]: this.mergeSchemaOptions({ type: Number }, this.config) });
  }

  getQueryConditions() {
    return {
      ...this.equalityConditions(),
      ...this.orderingConditions(),
      ...this.inConditions(),
    };
  }
}

class KnexFloatInterface extends KnexFieldAdapter {
  createColumn(table) {
    table.float(this.path);
  }
  getQueryConditions(f, g) {
    return {
      ...this.equalityConditions(f, g),
      ...this.orderingConditions(f, g),
      ...this.inConditions(f, g),
    };
  }
}

module.exports = {
  Float,
  MongoFloatInterface,
  KnexFloatInterface,
};
