import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystone-next/adapter-mongoose-legacy';
import { KnexFieldAdapter } from '@keystone-next/adapter-knex-legacy';
import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';

export class Text extends Implementation {
  constructor(path, { isMultiline }) {
    super(...arguments);
    this.isMultiline = isMultiline;
    this.isOrderable = true;
  }

  get _supportsUnique() {
    return true;
  }

  gqlOutputFields() {
    return [`${this.path}: String`];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }
  gqlQueryInputFields() {
    const { listAdapter } = this.adapter;
    return [
      ...this.equalityInputFields('String'),
      ...(listAdapter.name === 'prisma' && listAdapter.provider === 'sqlite'
        ? []
        : [
            ...this.stringInputFields('String'),
            ...this.equalityInputFieldsInsensitive('String'),
            ...this.stringInputFieldsInsensitive('String'),
          ]),
      ...this.inInputFields('String'),
    ];
  }
  gqlUpdateInputFields() {
    return [`${this.path}: String`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: String`];
  }
  extendAdminMeta(meta) {
    const { isMultiline } = this;
    return { isMultiline, ...meta };
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'string | null' } };
  }
}

const CommonTextInterface = superclass =>
  class extends superclass {
    getQueryConditions(dbPath) {
      const { listAdapter } = this;
      return {
        ...this.equalityConditions(dbPath),
        ...(listAdapter.name === 'prisma' && listAdapter.provider === 'sqlite'
          ? {}
          : {
              ...this.stringConditions(dbPath),
              ...this.equalityConditionsInsensitive(dbPath),
              ...this.stringConditionsInsensitive(dbPath),
            }),
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
  constructor() {
    super(...arguments);
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }

  addToTableSchema(table) {
    const column = table.text(this.path);
    if (this.isUnique) column.unique();
    else if (this.isIndexed) column.index();
    if (this.isNotNullable) column.notNullable();
    if (typeof this.defaultTo !== 'undefined') column.defaultTo(this.defaultTo);
  }
}

export class PrismaTextInterface extends CommonTextInterface(PrismaFieldAdapter) {
  constructor() {
    super(...arguments);
    this.isUnique = !!this.config.isUnique;
    this.isIndexed = !!this.config.isIndexed && !this.config.isUnique;
  }

  getPrismaSchema() {
    return [this._schemaField({ type: 'String' })];
  }
}
