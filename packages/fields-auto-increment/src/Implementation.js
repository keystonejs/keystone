import { Implementation } from '@keystone-alpha/fields';
import { KnexFieldAdapter } from '@keystone-alpha/adapter-knex';

export class AutoIncrementImplementation extends Implementation {
  constructor(path, config = {}, context = {}) {
    // Apply some field type defaults before we hand off to super; see README.md
    if (typeof config.isUnique === 'undefined') config.isUnique = true;
    if (typeof config.access === 'undefined') config.access = {};
    if (typeof config.access === 'object') {
      config.access = { create: false, update: false, delete: false, ...config.access };
    }

    // The base implementation takes care of everything else
    super(path, config, context);

    // If no valid gqlType is supplied, default based on whether or not we're the primary key
    const gqlTypeDefault = this.isPrimaryKey ? 'ID' : 'Int';
    this.gqlType = ['ID', 'Int'].includes(this.config.gqlType)
      ? this.config.gqlType
      : gqlTypeDefault;
  }

  get gqlOutputFields() {
    return [`${this.path}: ${this.gqlType}`];
  }
  get gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }
  get gqlQueryInputFields() {
    return [
      ...this.equalityInputFields(this.gqlType),
      ...this.orderingInputFields(this.gqlType),
      ...this.inInputFields(this.gqlType),
    ];
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: ${this.gqlType}`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: ${this.gqlType}`];
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
    if (this.field.isPrimaryKey) {
      // Fair to say primary keys are always non-nullable and uniqueness is implied by primary()
      table.increments(this.path).notNullable();
    } else {
      const column = table.specificType(this.path, 'serial');
      if (this.isUnique) column.unique();
      if (this.isNotNullable) column.notNullable();
    }
  }

  addToForeignTableSchema(table, { path, isUnique, isIndexed, isNotNullable }) {
    if (!this.field.isPrimaryKey) {
      throw `Can't create foreign key '${path}' on table "${table._tableName}"; ` +
        `'${this.path}' on list '${this.field.listKey}' as is not the primary key.`;
    }

    const column = table.integer(path).unsigned();
    if (isUnique) column.unique();
    else if (isIndexed) column.index();
    if (isNotNullable) column.notNullable();
  }

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath),
      ...this.orderingConditions(dbPath),
      ...this.inConditions(dbPath),
    };
  }
}
