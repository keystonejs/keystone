import { Implementation } from '@keystone-alpha/fields';
import { KnexFieldAdapter } from '@keystone-alpha/adapter-knex';

export class AutoIncrementImplementation extends Implementation {
  constructor(path, config = {}, context = {}) {
    // Apply some field type defaults before we hand off to super; see README.md
    if (typeof config.isUnique === 'undefined') config.isUnique = true;
    if (typeof config.access === 'undefined') config.access = {};
    config.access = { create: false, update: false, delete: false, ...config.access };

    // The base implementation takes care of everything else
    super(path, config, context);
  }

  get gqlOutputFields() {
    return [`${this.path}: Int`];
  }
  get gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }
  get gqlQueryInputFields() {
    return [...this.equalityInputFields('Int'), ...this.inInputFields('Int')];
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: Int`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: Int`];
  }
}

export class KnexAutoIncrementInterface extends KnexFieldAdapter {
  constructor(fieldName, path, field, listAdapter, getListByKey, knexOptions = {}) {
    // Apply some field type defaults before we hand off to super; see README.md
    knexOptions.isNotNullable =
      typeof knexOptions.isNotNullable === 'undefined' ? true : knexOptions.isNotNullable;

    // The base implementation takes care of everything else
    super(...arguments);
  }

  addToTableSchema(table) {
    // The knex `increments()` schema building function always uses the column as the primary key
    // If not isPrimaryKey use a raw `serial` instead
    // This will only work on PostgreSQL; see README.md
    const column = this.field.isPrimaryKey
      ? table.increments(this.path)
      : table.specificType(this.path, 'serial');

    if (this.isUnique) column.unique();
    if (this.isNotNullable) column.notNullable();
  }

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath),
      ...this.orderingConditions(dbPath),
      ...this.inConditions(dbPath),
    };
  }
}
