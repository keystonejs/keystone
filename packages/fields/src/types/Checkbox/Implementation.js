import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystone-alpha/adapter-mongoose';
import { KnexFieldAdapter } from '@keystone-alpha/adapter-knex';

export class Checkbox extends Implementation {
  constructor() {
    super(...arguments);
  }

  gqlOutputFields() {
    return [`${this.path}: Boolean`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  gqlQueryInputFields() {
    return this.equalityInputFields('Boolean');
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: Boolean`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: Boolean`];
  }
}

export class MongoCheckboxInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    schema.add({ [this.path]: this.mergeSchemaOptions({ type: Boolean }, this.config) });
  }
  getQueryConditions(dbPath) {
    return this.equalityConditions(dbPath);
  }
}

export class KnexCheckboxInterface extends KnexFieldAdapter {
  constructor() {
    super(...arguments);

    // Error rather than ignoring invalid config
    if (this.config.isUnique || this.config.isIndexed) {
      throw `The Checkbox field type doesn't support indexes on Knex. ` +
        `Check the config for ${this.path} on the ${this.field.listKey} list`;
    }
  }
  addToTableSchema(table) {
    const column = table.boolean(this.path);
    if (this.isNotNullable) column.notNullable();
    if (typeof this.defaultTo !== 'undefined') column.defaultTo(this.defaultTo);
  }
  getQueryConditions(dbPath) {
    return this.equalityConditions(dbPath);
  }
}
