import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';
import { PrismaFieldAdapter } from '@keystonejs/adapter-prisma';

export class Checkbox extends Implementation {
  constructor() {
    super(...arguments);
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return false;
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
  gqlUpdateInputFields() {
    return [`${this.path}: Boolean`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: Boolean`];
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'boolean | null' } };
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
    if (this.config.isIndexed) {
      throw (
        `The Checkbox field type doesn't support indexes on Knex. ` +
        `Check the config for ${this.path} on the ${this.field.listKey} list`
      );
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

export class PrismaCheckboxInterface extends PrismaFieldAdapter {
  constructor() {
    super(...arguments);

    // Error rather than ignoring invalid config
    if (this.config.isIndexed) {
      throw (
        `The Checkbox field type doesn't support indexes on Prisma. ` +
        `Check the config for ${this.path} on the ${this.field.listKey} list`
      );
    }
  }
  getPrismaSchema() {
    return [this._schemaField({ type: 'Boolean' })];
  }

  getQueryConditions(dbPath) {
    return this.equalityConditions(dbPath);
  }
}
