import { Implementation } from '@keystone-alpha/fields';
import { MongooseFieldAdapter } from '@keystone-alpha/adapter-mongoose';
import { KnexFieldAdapter } from '@keystone-alpha/adapter-knex';

export class MongoIdImplementation extends Implementation {
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

const validator = a => (a ? /^[0-9a-fA-F]{24}$/.test(a.toString()) : true);
const normaliseValue = a => (a ? a.toString().toLowerCase() : null);

export class MongooseMongoIdInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema, mongoose) {
    const schemaOptions = {
      type: mongoose.Schema.Types.ObjectId,
      validate: {
        validator: this.buildValidator(validator),
        message: '{VALUE} is not a valid Mongo ObjectId',
      },
    };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }
  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath),
      ...this.inConditions(dbPath),
    };
  }
}

export class KnexMongoIdInterface extends KnexFieldAdapter {
  addToTableSchema(table) {
    const column = table.string(this.path, 24);
    if (this.isUnique) column.unique();
    if (this.isNotNullable) column.notNullable();
    if (this.defaultTo) column.defaultTo(this.defaultTo);
  }

  setupHooks({ addPreSaveHook, addPostReadHook }) {
    addPreSaveHook(item => {
      const valType = typeof item[this.path];

      if (item[this.path] && valType === 'string') {
        item[this.path] = normaliseValue(item[this.path]);
      } else if (!item[this.path] || valType === 'undefined') {
        delete item[this.path];
      } else {
        // Should have been caught by the validator??
        throw `Invalid value given for '${this.path}'`;
      }

      return item;
    });
    addPostReadHook(item => {
      if (item[this.path]) {
        item[this.path] = normaliseValue(item[this.path]);
      }
      return item;
    });
  }

  getQueryConditions(dbPath) {
    return {
      ...this.equalityConditions(dbPath, normaliseValue),
      ...this.inConditions(dbPath, normaliseValue),
    };
  }
}
