import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';
import { PrismaFieldAdapter } from '@keystonejs/adapter-prisma';

export class Float extends Implementation {
  constructor() {
    super(...arguments);
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: Float`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('Float'),
      ...this.orderingInputFields('Float'),
      ...this.inInputFields('Float'),
    ];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: Float`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: Float`];
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'number | null' } };
  }
}

const CommonFloatInterface = superclass =>
  class extends superclass {
    getQueryConditions(dbPath) {
      return {
        ...this.equalityConditions(dbPath),
        ...this.orderingConditions(dbPath),
        ...this.inConditions(dbPath),
      };
    }
  };

export class MongoFloatInterface extends CommonFloatInterface(MongooseFieldAdapter) {
  addToMongooseSchema(schema) {
    schema.add({ [this.path]: this.mergeSchemaOptions({ type: Number }, this.config) });
  }
}

export class KnexFloatInterface extends CommonFloatInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }

  addToTableSchema(table) {
    const column = table.float(this.path);
    if (this.isUnique) column.unique();
    else if (this.isIndexed) column.index();
    if (this.isNotNullable) column.notNullable();
    if (typeof this.defaultTo !== 'undefined') column.defaultTo(this.defaultTo);
  }
}

export class PrismaFloatInterface extends CommonFloatInterface(PrismaFieldAdapter) {
  constructor() {
    super(...arguments);
  }

  getPrismaSchema() {
    return this._schemaField({ type: 'Float' });
  }
}
