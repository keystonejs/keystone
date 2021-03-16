import { Implementation } from '@keystone-next/fields-legacy';
import { KnexFieldAdapter } from '@keystone-next/adapter-knex-legacy';
import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';

export class AutoIncrementImplementation extends Implementation {
  constructor(path, { gqlType, isUnique = true, access = {}, ...config } = {}, context = {}) {
    // Apply some field type defaults before we hand off to super; see README.md
    if (typeof access === 'object') {
      access = { create: false, update: false, delete: false, ...access };
    }

    // The base implementation takes care of everything else
    super(
      path,
      {
        ...config,
        isUnique,
        access,
      },
      context
    );

    // If no valid gqlType is supplied, default based on whether or not we're the primary key
    this.gqlType = ['ID', 'Int'].includes(gqlType) ? gqlType : this.isPrimaryKey ? 'ID' : 'Int';
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: ${this.gqlType}${this.isPrimaryKey ? '!' : ''}`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }
  gqlQueryInputFields() {
    return [
      ...this.equalityInputFields(this.gqlType),
      ...this.orderingInputFields(this.gqlType),
      ...this.inInputFields(this.gqlType),
    ];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: ${this.gqlType}`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: ${this.gqlType}`];
  }

  getBackingTypes() {
    if (this.path === 'id') {
      return { [this.path]: { optional: false, type: 'string' } };
    }
    return { [this.path]: { optional: true, type: 'number | null' } };
  }
}

export class KnexAutoIncrementInterface extends KnexFieldAdapter {
  constructor() {
    super(...arguments);

    // Default isUnique to true if not specified
    this.isUnique = typeof this.config.isUnique === 'undefined' ? true : !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }

  // Override isNotNullable defaulting logic; default to true if not specified
  get isNotNullable() {
    if (this._isNotNullable) return this._isNotNullable;
    return (this._isNotNullable = !!(typeof this.knexOptions.isNotNullable === 'undefined'
      ? true
      : this.knexOptions.isNotNullable));
  }

  addToTableSchema(table) {
    // The knex `increments()` schema building function always uses the column as the primary key
    // If not isPrimaryKey use a raw `serial` instead
    // This will only work on PostgreSQL; see README.md
    if (this.field.isPrimaryKey) {
      // Fair to say primary keys are always non-nullable and uniqueness is implied by primary()
      table.increments(this.path).notNullable();
      // TODO: Warning on invalid primary key config options?
    } else {
      const column = table.specificType(this.path, 'serial');
      if (this.isUnique) column.unique();
      else if (this.isIndexed) column.index();
      if (this.isNotNullable) column.notNullable();
    }
  }

  addToForeignTableSchema(table, { path, isUnique, isIndexed, isNotNullable }) {
    if (!this.field.isPrimaryKey) {
      throw (
        `Can't create foreign key '${path}' on table "${table._tableName}"; ` +
        `'${this.path}' on list '${this.field.listKey}' as is not the primary key.`
      );
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

export class PrismaAutoIncrementInterface extends PrismaFieldAdapter {
  constructor() {
    super(...arguments);
    if (this.listAdapter.parentAdapter.provider === 'sqlite' && !this.field.isPrimaryKey) {
      throw new Error(
        `PrismaAdapter provider "sqlite" does not support field type "${this.field.constructor.name}"`
      );
    }
    // Default isUnique to true if not specified
    this.isUnique = typeof this.config.isUnique === 'undefined' ? true : !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }

  getPrismaSchema() {
    return [this._schemaField({ type: 'Int', extra: '@default(autoincrement())' })];
  }

  gqlToPrisma(value) {
    // If we're an ID type then we'll be getting strings from GQL
    return Number(value);
    // console.log(this.field.gqlType);
    // return this.field.gqlType === 'ID' ? Number(value) : value;
  }

  equalityConditions(dbPath, f) {
    return {
      [this.path]: value => ({ [dbPath]: f(value) }),
      [`${this.path}_not`]: value => ({ NOT: { [this.path]: f(value) } }),
    };
  }

  inConditions(dbPath, f) {
    return {
      [`${this.path}_in`]: value =>
        value.includes(null)
          ? { [dbPath]: { in: f(value.filter(x => x !== null)) } }
          : { [dbPath]: { in: f(value) } },
      [`${this.path}_not_in`]: value =>
        value.includes(null)
          ? { AND: [{ NOT: { [dbPath]: { in: f(value.filter(x => x !== null)) } } }] }
          : { NOT: { [dbPath]: { in: f(value) } } },
    };
  }

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath, x => Number(x) || -1),
      ...this.orderingConditions(dbPath, x => Number(x) || -1),
      ...this.inConditions(dbPath, x => x.map(xx => Number(xx) || -1)),
    };
  }
}
