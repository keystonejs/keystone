import { Implementation } from '@keystonejs/fields';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';

export class MongoIdImplementation extends Implementation {
  gqlOutputFields() {
    return [`${this.path}: ID`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }
  gqlQueryInputFields() {
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
    // If this field is the primary key we actually don't have to add it; it's implicit
    if (this.field.isPrimaryKey) return;

    const schemaOptions = {
      type: mongoose.Schema.Types.ObjectId,
      validate: {
        validator: this.buildValidator(validator),
        message: '{VALUE} is not a valid Mongo ObjectId',
      },
    };
    schema.add({
      [this.field.isPrimaryKey ? '_id' : this.path]: this.mergeSchemaOptions(
        schemaOptions,
        this.config
      ),
    });
  }

  setupHooks({ addPreSaveHook, addPostReadHook }) {
    if (!this.field.isPrimaryKey) return;

    addPreSaveHook(item => {
      if (item.id) {
        item._id = item.id;
        delete item.id;
      }
      return item;
    });
    addPostReadHook(itemOrModel => {
      // Sometimes this is called with a mongoose model, sometimes with an object and sometimes with null
      // I do no know why
      const item = itemOrModel && itemOrModel.toObject ? itemOrModel.toObject() : itemOrModel;

      if (item && item._id) {
        item.id = item._id.toString();
        delete item._id;
      }
      return item;
    });
  }

  getQueryConditions(dbPath) {
    const mongoose = this.listAdapter.parentAdapter.mongoose;
    return {
      ...this.equalityConditions(this.field.isPrimaryKey ? '_id' : dbPath, mongoose.Types.ObjectId),
      ...this.inConditions(this.field.isPrimaryKey ? '_id' : dbPath, mongoose.Types.ObjectId),
    };
  }
}

export class KnexMongoIdInterface extends KnexFieldAdapter {
  constructor() {
    super(...arguments);
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }

  addToTableSchema(table) {
    const column = table.string(this.path, 24);
    if (this.isUnique) column.unique();
    else if (this.isIndexed) column.index();
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
