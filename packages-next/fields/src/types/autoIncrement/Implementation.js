import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Implementation } from '../../Implementation';

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
