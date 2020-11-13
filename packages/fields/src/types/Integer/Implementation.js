import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';
import { PrismaFieldAdapter } from '@keystonejs/adapter-prisma';

export class Integer extends Implementation {
  constructor() {
    super(...arguments);
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: Int`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('Int'),
      ...this.orderingInputFields('Int'),
      ...this.inInputFields('Int'),
    ];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: Int`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: Int`];
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'number | null' } };
  }
}

const CommonIntegerInterface = superclass =>
  class extends superclass {
    getQueryConditions(dbPath) {
      return {
        ...this.equalityConditions(dbPath),
        ...this.orderingConditions(dbPath),
        ...this.inConditions(dbPath),
      };
    }
  };

export class MongoIntegerInterface extends CommonIntegerInterface(MongooseFieldAdapter) {
  addToMongooseSchema(schema) {
    const schemaOptions = {
      type: Number,
      validate: {
        validator: this.buildValidator(a => typeof a === 'number' && Number.isInteger(a)),
        message: '{VALUE} is not an integer value',
      },
    };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }
}

export class KnexIntegerInterface extends CommonIntegerInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }

  addToTableSchema(table) {
    const column = table.integer(this.path);
    if (this.isUnique) column.unique();
    else if (this.isIndexed) column.index();
    if (this.isNotNullable) column.notNullable();
    if (typeof this.defaultTo !== 'undefined') column.defaultTo(this.defaultTo);
  }
}

export class PrismaIntegerInterface extends CommonIntegerInterface(PrismaFieldAdapter) {
  constructor() {
    super(...arguments);
  }

  getPrismaSchema() {
    return this._schemaField({ type: 'Int' });
  }
}
