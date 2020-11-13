import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';
import { PrismaFieldAdapter } from '@keystonejs/adapter-prisma';

export class UuidImplementation extends Implementation {
  constructor(path, { caseTo = 'lower' }) {
    super(...arguments);

    this.normaliseValue = a => a;
    if (caseTo && caseTo.toString().toLowerCase() === 'upper') {
      this.normaliseValue = a => a && a.toString().toUpperCase();
    } else if (caseTo && caseTo.toString().toLowerCase() === 'lower') {
      this.normaliseValue = a => a && a.toString().toLowerCase();
    }
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: ID${this.isPrimaryKey ? '!' : ''}`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }
  gqlQueryInputFields() {
    return [...this.equalityInputFields('ID'), ...this.inInputFields('ID')];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: ID`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: ID`];
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'string | null' } };
  }
}

const validator = a =>
  typeof a === 'string' &&
  /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/.test(a);

// TODO: UUIDs _should_ be stored in Mongo using binary subtype 0x04 but strings are easier; see README.md
export class MongoUuidInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema, mongoose) {
    const schemaOptions = {
      type: mongoose.Schema.Types.String,
      validate: {
        validator: this.buildValidator(validator),
        message: '{VALUE} is not a valid UUID. Must be 8-4-4-4-12 hex format',
      },
    };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }

  setupHooks({ addPreSaveHook, addPostReadHook }) {
    // TODO: Remove the need to dereference the list and field to get the normalise function
    addPreSaveHook(item => {
      // Only run the hook if the item actually contains the field
      // NOTE: Can't use hasOwnProperty here, as the mongoose data object
      // returned isn't a POJO
      if (!(this.path in item)) {
        return item;
      }

      if (item[this.path]) {
        if (typeof item[this.path] === 'string') {
          item[this.path] = this.field.normaliseValue(item[this.path]);
        } else {
          // Should have been caught by the validator??
          throw `Invalid UUID value given for '${this.path}'`;
        }
      } else {
        item[this.path] = null;
      }

      return item;
    });
    addPostReadHook(item => {
      if (item[this.path]) {
        item[this.path] = this.field.normaliseValue(item[this.path]);
      }
      return item;
    });
  }

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath, this.field.normaliseValue),
      ...this.inConditions(dbPath, this.field.normaliseValue),
    };
  }
}

export class KnexUuidInterface extends KnexFieldAdapter {
  constructor() {
    super(...arguments);

    // TODO: Warning on invalid config for primary keys?
    if (!this.field.isPrimaryKey) {
      this.isUnique = !!this.config.isUnique;
      this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
    }
  }

  addToTableSchema(table) {
    const column = table.uuid(this.path);
    // Fair to say primary keys are always non-nullable and uniqueness is implied by primary()
    if (this.field.isPrimaryKey) {
      column.primary().notNullable();
    } else {
      if (this.isUnique) column.unique();
      else if (this.isIndexed) column.index();
      if (this.isNotNullable) column.notNullable();
    }
    if (this.defaultTo) column.defaultTo(this.defaultTo);
  }

  addToForeignTableSchema(table, { path, isUnique, isIndexed, isNotNullable }) {
    if (!this.field.isPrimaryKey) {
      throw (
        `Can't create foreign key '${path}' on table "${table._tableName}"; ` +
        `'${this.path}' on list '${this.field.listKey}' as is not the primary key.`
      );
    }

    const column = table.uuid(path);
    if (isUnique) column.unique();
    else if (isIndexed) column.index();
    if (isNotNullable) column.notNullable();
  }

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath, this.field.normaliseValue),
      ...this.inConditions(dbPath, this.field.normaliseValue),
    };
  }
}

export class PrismaUuidInterface extends PrismaFieldAdapter {
  constructor() {
    super(...arguments);

    // TODO: Warning on invalid config for primary keys?
    if (!this.field.isPrimaryKey) {
      this.isUnique = !!this.config.isUnique;
      this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
    }
  }

  getPrismaSchema() {
    return [this._schemaField({ type: 'String' })];
  }

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath, this.field.normaliseValue),
      ...this.inConditions(dbPath, this.field.normaliseValue),
    };
  }
}
