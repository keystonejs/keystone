import { MongooseFieldAdapter } from '@keystone-next/adapter-mongoose-legacy';
import { KnexFieldAdapter } from '@keystone-next/adapter-knex-legacy';
import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Implementation } from '@keystone-next/fields-legacy';
// eslint-disable-next-line import/no-unresolved
import { addRelationshipData } from './relationship-data';

// this includes the list key and path because in the future
// there will likely be additional fields specific to a particular field
// such as exposing the relationships in the document
const outputType = field => `${field.listKey}_${field.path}_DocumentField`;

export class DocumentImplementation extends Implementation {
  get _supportsUnique() {
    return false;
  }

  gqlOutputFields() {
    return [`${this.path}: ${outputType(this)}`];
  }

  getGqlAuxTypes() {
    return [
      `type ${outputType(this)} {
      document(hydrateRelationships: Boolean! = false): JSON!
    }`,
    ];
  }

  gqlAuxFieldResolvers() {
    return {
      [outputType(this)]: {
        document: (rootVal, { hydrateRelationships }) => rootVal.document(hydrateRelationships),
      },
    };
  }
  // Called on `User.avatar` for example
  gqlOutputFieldResolvers() {
    return {
      [this.path]: (item, _args, context) => {
        const document = item[this.path];
        if (!Array.isArray(document)) return null;
        return {
          document: hydrateRelationships =>
            hydrateRelationships
              ? addRelationshipData(
                  document,
                  context.graphql,
                  this.config.relationships,
                  this.config.componentBlocks,
                  listKey => context.keystone.lists[listKey].gqlNames
                )
              : document,
        };
      },
    };
  }

  resolveInput({ resolvedData }) {
    const data = resolvedData[this.path];
    if (data === null) {
      return null;
    }
    if (data === undefined) {
      return undefined;
    }
    const nodes = this.config.___validateAndNormalize(data);
    if (this.adapter.constructor === KnexDocumentInterface) {
      // knex expects the json to be stringified
      return JSON.stringify(nodes);
    }
    return nodes;
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
    if (this.listAdapter.parentAdapter.provider === 'sqlite') {
      throw new Error(
        `PrismaAdapter provider "sqlite" does not support field type "${this.field.constructor.name}"`
      );
    }
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
