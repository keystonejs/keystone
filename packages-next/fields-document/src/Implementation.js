import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';
import { PrismaFieldAdapter } from '@keystonejs/adapter-prisma';
import { Implementation } from '@keystonejs/fields';

const graphQLOutputType = 'DocumentField';

export class DocumentImplementation extends Implementation {
  get _supportsUnique() {
    return false;
  }

  gqlOutputFields() {
    return [`${this.path}: ${graphQLOutputType}`];
  }

  getGqlAuxTypes() {
    return [
      `type ${graphQLOutputType} {
      document: JSON
    }`,
    ];
  }

  gqlQueryInputFields() {
    return [...this.equalityInputFields('JSON'), ...this.inInputFields('JSON')];
  }

  // Called on `User.avatar` for example
  gqlOutputFieldResolvers() {
    return {
      [this.path]: item => {
        if (!Array.isArray(item[this.path])) return null;
        return { document: item[this.path] };
      },
    };
  }

  gqlUpdateInputFields() {
    return [`${this.path}: JSON`];
  }
  gqlCreateInputFields() {
    return [`${this.path}: JSON`];
  }
  getBackingTypes() {
    return { [this.path]: { optional: true, type: 'Record<string, any>[] | null' } };
  }
}

const CommonDocumentInterface = superclass =>
  class extends superclass {
    getQueryConditions() {
      return {};
    }
  };

export class MongoDocumentInterface extends CommonDocumentInterface(MongooseFieldAdapter) {
  addToMongooseSchema(schema) {
    const schemaOptions = { type: Object };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }
}

export class KnexDocumentInterface extends CommonDocumentInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);

    // Error rather than ignoring invalid config
    // We totally can index these values, it's just not trivial. See issue #1297
    if (this.config.isIndexed) {
      throw new Error(
        `The Document field type doesn't support indexes on Knex. ` +
          `Check the config for ${this.path} on the ${this.field.listKey} list`
      );
    }
  }

  addToTableSchema(table) {
    const column = table.jsonb(this.path);
    if (this.isNotNullable) column.notNullable();
    if (this.defaultTo) column.defaultTo(this.defaultTo);
  }
}

export class PrismaDocumentInterface extends CommonDocumentInterface(PrismaFieldAdapter) {
  constructor() {
    super(...arguments);

    // Error rather than ignoring invalid config
    // We totally can index these values, it's just not trivial. See issue #1297
    if (this.config.isIndexed) {
      throw new Error(
        `The Document field type doesn't support indexes on Prisma. ` +
          `Check the config for ${this.path} on the ${this.field.listKey} list`
      );
    }
  }

  getPrismaSchema() {
    return [this._schemaField({ type: 'Json' })];
  }
}
