import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Implementation } from '@keystone-next/fields';
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
        let document = item[this.path];
        if (this.adapter.listAdapter.parentAdapter.provider === 'sqlite') {
          // we store document data as a string on sqlite because Prisma doesn't support Json on sqlite
          // https://github.com/prisma/prisma/issues/3786
          try {
            document = JSON.parse(document);
          } catch (err) {}
        }
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
    if (this.adapter.listAdapter.parentAdapter.provider === 'sqlite') {
      // we store document data as a string on sqlite because Prisma doesn't support Json on sqlite
      // https://github.com/prisma/prisma/issues/3786
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

export class PrismaDocumentInterface extends PrismaFieldAdapter {
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
    return [
      this._schemaField({
        type:
          this.listAdapter.parentAdapter.provider === 'sqlite'
            ? // we store document data as a string on sqlite because Prisma doesn't support Json on sqlite
              // https://github.com/prisma/prisma/issues/3786
              'String'
            : 'Json',
      }),
    ];
  }

  getQueryConditions() {
    return {};
  }
}
