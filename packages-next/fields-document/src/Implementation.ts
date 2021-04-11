import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Implementation } from '@keystone-next/fields';
import { FieldConfigArgs, FieldExtraArgs } from '@keystone-next/fields';
import { KeystoneContext } from '@keystone-next/types';
// eslint-disable-next-line import/no-unresolved
import { addRelationshipData } from './relationship-data';
import { ComponentBlock } from './component-blocks';
import { Relationships } from './DocumentEditor/relationship';

type List = { adapter: PrismaListAdapter };

// this includes the list key and path because in the future
// there will likely be additional fields specific to a particular field
// such as exposing the relationships in the document
const outputType = (field: DocumentImplementation<any>) =>
  `${field.listKey}_${field.path}_DocumentField`;

export class DocumentImplementation<P extends string> extends Implementation<P> {
  relationships: Relationships;
  componentBlocks: Record<string, ComponentBlock>;
  ___validateAndNormalize: (data: unknown) => unknown[];
  constructor(
    path: P,
    {
      relationships,
      componentBlocks,
      ___validateAndNormalize,
      ...configArgs
    }: FieldConfigArgs & {
      relationships: Relationships;
      componentBlocks: Record<string, ComponentBlock>;
      ___validateAndNormalize: (data: unknown) => unknown[];
    },
    extraArgs: FieldExtraArgs
  ) {
    super(
      path,
      { relationships, componentBlocks, ___validateAndNormalize, ...configArgs },
      extraArgs
    );
    this.relationships = relationships;
    this.componentBlocks = componentBlocks;
    this.___validateAndNormalize = ___validateAndNormalize;
  }

  get _supportsUnique() {
    return false;
  }

  gqlOutputFields(): string[] {
    return [`${this.path}: ${outputType(this)}`];
  }

  getGqlAuxTypes(): string[] {
    return [
      `type ${outputType(this)} {
      document(hydrateRelationships: Boolean! = false): JSON!
    }`,
    ];
  }

  gqlAuxFieldResolvers(): Record<string, any> {
    return {
      [outputType(this)]: {
        document: (rootVal: any, { hydrateRelationships }: { hydrateRelationships: boolean }) =>
          rootVal.document(hydrateRelationships),
      },
    };
  }
  // Called on `User.avatar` for example
  gqlOutputFieldResolvers() {
    return {
      [this.path]: (item: Record<P, any>, _args: any, context: KeystoneContext) => {
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
          document: (hydrateRelationships: boolean) =>
            hydrateRelationships
              ? addRelationshipData(
                  document,
                  context.graphql,
                  this.relationships,
                  this.componentBlocks,
                  listKey => context.keystone.lists[listKey].gqlNames
                )
              : document,
        };
      },
    };
  }

  async resolveInput({ resolvedData }: { resolvedData: Record<P, any> }) {
    const data = resolvedData[this.path];
    if (data === null) {
      return null;
    }
    if (data === undefined) {
      return undefined;
    }
    const nodes = this.___validateAndNormalize(data);
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

export class PrismaDocumentInterface<P extends string> extends PrismaFieldAdapter<P> {
  constructor(
    fieldName: string,
    path: P,
    field: DocumentImplementation<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => List | undefined,
    config = {}
  ) {
    super(fieldName, path, field, listAdapter, getListByKey, config);
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
