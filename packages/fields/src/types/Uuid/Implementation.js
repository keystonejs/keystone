import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystone-alpha/adapter-mongoose';
import { KnexFieldAdapter } from '@keystone-alpha/adapter-knex';

export class Uuid extends Implementation {
  constructor(path, { caseTo = 'lower' }) {
    super(...arguments);

    this.normaliseValue = a => a;
    if (caseTo && caseTo.toString().toLowerCase() === 'upper') {
      this.normaliseValue = a => a.toString().toUpperCase();
    } else if (caseTo && caseTo.toString().toLowerCase() === 'lower') {
      this.normaliseValue = a => a.toString().toLowerCase();
    }
  }

  get gqlOutputFields() {
    return [`${this.path}: ID`];
  }
  get gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }
  get gqlQueryInputFields() {
    return [...this.equalityInputFields('ID'), ...this.inInputFields('ID')];
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: ID`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: ID`];
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
      const valType = typeof item[this.path];

      if (item[this.path] && valType === 'string') {
        item[this.path] = this.field.normaliseValue(item[this.path]);
      } else if (!item[this.path] || valType === 'undefined') {
        delete item[this.path];
      } else {
        // Should have been caught by the validator??
        throw `Invalid UUID value given for '${this.path}'`;
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
  addToTableSchema(table) {
    const column = table.uuid(this.path);
    if (this.isUnique) column.unique();
    if (this.isRequired) column.notNullable();
  }

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath, this.field.normaliseValue),
      ...this.inConditions(dbPath, this.field.normaliseValue),
    };
  }
}
