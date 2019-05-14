import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystone-alpha/adapter-mongoose';
import { KnexFieldAdapter } from '@keystone-alpha/adapter-knex';

export class Text extends Implementation {
  constructor(path, { isMultiline }) {
    super(...arguments);
    this.isMultiline = isMultiline;
  }
  get gqlOutputFields() {
    return [`${this.path}: String`];
  }
  get gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }
  get gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('String'),
      ...this.stringInputFields('String'),
      ...this.equalityInputFieldsInsensitive('String'),
      ...this.stringInputFieldsInsensitive('String'),
      ...this.inInputFields('String'),
    ];
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: String`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: String`];
  }
  extendAdminMeta(meta) {
    const { isMultiline } = this;
    return { isMultiline, ...meta };
  }
}

const CommonTextInterface = superclass =>
  class extends superclass {
    getQueryConditions(dbPath) {
      return {
        ...this.equalityConditions(dbPath),
        ...this.stringConditions(dbPath),
        ...this.equalityConditionsInsensitive(dbPath),
        ...this.stringConditionsInsensitive(dbPath),
        // These have no case-insensitive counter parts
        ...this.inConditions(dbPath),
      };
    }
  };

export class MongoTextInterface extends CommonTextInterface(MongooseFieldAdapter) {
  addToMongooseSchema(schema) {
    schema.add({ [this.path]: this.mergeSchemaOptions({ type: String }, this.config) });
  }
}

export class KnexTextInterface extends CommonTextInterface(KnexFieldAdapter) {
  createColumn(table) {
    return table.text(this.path);
  }
}
