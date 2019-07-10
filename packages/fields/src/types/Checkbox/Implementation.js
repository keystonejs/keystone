import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystone-alpha/adapter-mongoose';
import { KnexFieldAdapter } from '@keystone-alpha/adapter-knex';

export class Checkbox extends Implementation {
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

export class MongoCheckboxInterface extends CommonCheckboxInterface(MongooseFieldAdapter) {
  addToMongooseSchema(schema) {
    schema.add({ [this.path]: this.mergeSchemaOptions({ type: Boolean }, this.config) });
  }
}

export class KnexCheckboxInterface extends CommonCheckboxInterface(KnexFieldAdapter) {
  addToTableSchema(table) {
    const column = table.boolean(this.path);
    if (this.isNotNullable) column.notNullable();
    if (this.defaultTo) column.defaultTo(this.defaultTo);
  }
}
