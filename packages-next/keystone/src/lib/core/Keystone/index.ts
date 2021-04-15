import { gql } from 'apollo-server-express';
import { GraphQLUpload } from 'graphql-upload';
import { objMerge, flatten, unique, filterValues } from '@keystone-next/utils-legacy';
import {
  BaseKeystone,
  BaseKeystoneList,
  BaseListConfig,
  KeystoneContext,
  Rel,
} from '@keystone-next/types';
import { PrismaAdapter } from '@keystone-next/adapter-prisma-legacy';
import { Relationship } from '@keystone-next/fields/src/types/relationship/Implementation';
import { List } from '../ListTypes';
import { ListCRUDProvider } from '../providers';

export class Keystone implements BaseKeystone {
  lists: Record<string, BaseKeystoneList>;
  listsArray: BaseKeystoneList[];
  getListByKey: (key: string) => BaseKeystoneList | undefined;
  onConnect: (keystone: BaseKeystone, args?: { context: KeystoneContext }) => Promise<void>;
  _listCRUDProvider: any;
  _providers: any[];
  adapter: PrismaAdapter;
  queryLimits: { maxTotalResults: number };

  constructor({
    adapter,
    onConnect,
    queryLimits = {},
  }: {
    adapter: PrismaAdapter;
    onConnect: (keystone: BaseKeystone, args?: { context: KeystoneContext }) => Promise<void>;
    queryLimits: { maxTotalResults?: number | undefined } | undefined;
  }) {
    this.lists = {};
    this.listsArray = [];
    this.getListByKey = key => this.lists[key];
    this.onConnect = onConnect;
    this._listCRUDProvider = new ListCRUDProvider();
    this._providers = [this._listCRUDProvider];
    this.adapter = adapter;
    this.queryLimits = { maxTotalResults: Infinity, ...queryLimits };
    if (this.queryLimits.maxTotalResults < 1) {
      throw new Error("queryLimits.maxTotalResults can't be < 1");
    }
  }

  createList(key: string, config: BaseListConfig) {
    const { getListByKey, adapter } = this;
    const isReservedName = key[0] === '_';

    if (isReservedName) {
      throw new Error(`Invalid list name "${key}". List names cannot start with an underscore.`);
    }
    if (['Query', 'Subscription', 'Mutation'].includes(key)) {
      throw new Error(
        `Invalid list name "${key}". List names cannot be reserved GraphQL keywords.`
      );
    }

    // Keystone automatically adds an 'Upload' scalar type to the GQL schema. Since list output
    // types are named after their keys, having a list name 'Upload' will clash and cause a confusing
    // error on start.
    if (key === 'Upload' || key === 'upload') {
      throw new Error(
        `Invalid list name "Upload": Built-in GraphQL types cannot be used as a list name.`
      );
    }

    const list: BaseKeystoneList = new List(key, config, { getListByKey, adapter });
    this.lists[key] = list;
    this.listsArray.push(list);
    this._listCRUDProvider.lists.push(list);
    list.initFields();
    return list;
  }

  _consolidateRelationships() {
    const rels: Record<string, Rel> = {};
    const otherSides: Record<string, string> = {};
    this.listsArray.forEach(list => {
      list.fields
        .filter(f => f.isRelationship)
        .forEach(_f => {
          const f = _f as Relationship<any>;
          const myRef = `${f.listKey}.${f.path}`;
          if (otherSides[myRef]) {
            // I'm already there, go and update rels[otherSides[myRef]] with my info
            rels[otherSides[myRef]].right = f;

            // Make sure I'm actually referencing the thing on the left
            const { left } = rels[otherSides[myRef]];
            if (f.ref !== `${left.listKey}.${left.path}`) {
              throw new Error(`${myRef} refers to ${f.ref}. Expected ${left.listKey}.${left.path}`);
            }
          } else {
            // Got us a new relationship!
            rels[myRef] = { left: f };
            if (f.refFieldPath) {
              // Populate otherSides
              otherSides[f.ref] = myRef;
            }
          }
        });
    });
    // See if anything failed to link up.
    const badRel = Object.values(rels).find(({ left, right }) => left.refFieldPath && !right);
    if (badRel) {
      const { left } = badRel;
      throw new Error(`${left.listKey}.${left.path} refers to a non-existant field, ${left.ref}`);
    }

    // Ensure that the left/right pattern is always the same no matter what order
    // the lists and fields are defined.
    Object.values(rels).forEach(rel => {
      const { left, right } = rel;
      if (right) {
        const order = left.listKey.localeCompare(right.listKey);
        if (order > 0) {
          // left comes after right, so swap them.
          rel.left = right;
          rel.right = left;
        } else if (order === 0) {
          // self referential list, so check the paths.
          if (left.path.localeCompare(right.path) > 0) {
            rel.left = right;
            rel.right = left;
          }
        }
      }
    });

    Object.values(rels).forEach(rel => {
      const { left, right } = rel;
      let cardinality: Rel['cardinality'];
      if (left.many) {
        if (right) {
          if (right.many) {
            cardinality = 'N:N';
          } else {
            cardinality = '1:N';
          }
        } else {
          // right not specified, have to assume that it's N:N
          cardinality = 'N:N';
        }
      } else {
        if (right) {
          if (right.many) {
            cardinality = 'N:1';
          } else {
            cardinality = '1:1';
          }
        } else {
          // right not specified, have to assume that it's N:1
          cardinality = 'N:1';
        }
      }
      rel.cardinality = cardinality;

      let tableName;
      let columnName;
      if (cardinality === 'N:N') {
        tableName = right
          ? `${left.listKey}_${left.path}_${right.listKey}_${right.path}`
          : `${left.listKey}_${left.path}_many`;
        if (right) {
          const leftKey = `${left.listKey}.${left.path}`;
          const rightKey = `${right.listKey}.${right.path}`;
          rel.columnNames = {
            [leftKey]: { near: `${left.listKey}_left_id`, far: `${right.listKey}_right_id` },
            [rightKey]: { near: `${right.listKey}_right_id`, far: `${left.listKey}_left_id` },
          };
        } else {
          const leftKey = `${left.listKey}.${left.path}`;
          const rightKey = `${left.ref}`;
          rel.columnNames = {
            [leftKey]: { near: `${left.listKey}_left_id`, far: `${left.ref}_right_id` },
            [rightKey]: { near: `${left.ref}_right_id`, far: `${left.listKey}_left_id` },
          };
        }
      } else if (cardinality === '1:1') {
        tableName = left.listKey;
        columnName = left.path;
      } else if (cardinality === '1:N') {
        tableName = right!.listKey;
        columnName = right!.path;
      } else {
        tableName = left.listKey;
        columnName = left.path;
      }
      rel.tableName = tableName;
      rel.columnName = columnName;
    });

    return Object.values(rels);
  }

  async connect(args?: { context: KeystoneContext }): Promise<void> {
    await this.adapter.connect({ rels: this._consolidateRelationships() });

    if (this.onConnect) {
      return this.onConnect(this, args);
    }
  }

  async disconnect() {
    await this.adapter.disconnect();
  }

  getTypeDefs({ schemaName }: { schemaName: string }) {
    const queries = unique(flatten(this._providers.map(p => p.getQueries({ schemaName }))));
    const mutations = unique(flatten(this._providers.map(p => p.getMutations({ schemaName }))));
    const subscriptions = unique(
      flatten(this._providers.map(p => p.getSubscriptions({ schemaName })))
    );

    // Fields can be represented multiple times within and between lists.
    // If a field defines a `getGqlAuxTypes()` method, it will be
    // duplicated.
    // graphql-tools will blow up (rightly so) on duplicated types.
    // Deduping here avoids that problem.
    return [
      ...unique(flatten(this._providers.map(p => p.getTypes({ schemaName })))),
      queries.length > 0 && `type Query { ${queries.join('\n')} }`,
      mutations.length > 0 && `type Mutation { ${mutations.join('\n')} }`,
      subscriptions.length > 0 && `type Subscription { ${subscriptions.join('\n')} }`,
      'scalar Upload',
    ]
      .filter(s => s)
      .map(s => gql(s));
  }

  getResolvers({ schemaName }: { schemaName: string }) {
    // Like the `typeDefs`, we want to dedupe the resolvers. We rely on the
    // semantics of the JS spread operator here (duplicate keys are overridden
    // - last one wins)
    // TODO: Document this order of precedence, because it's not obvious, and
    // there's no errors thrown
    // TODO: console.warn when duplicate keys are detected?
    const resolvers: Record<string, any> = {
      // Order of spreading is important here - we don't want user-defined types
      // to accidentally override important things like `Query`.
      ...objMerge(this._providers.map(p => p.getTypeResolvers({ schemaName }))),
      Query: objMerge(this._providers.map(p => p.getQueryResolvers({ schemaName }))),
      Mutation: objMerge(this._providers.map(p => p.getMutationResolvers({ schemaName }))),
      Subscription: objMerge(this._providers.map(p => p.getSubscriptionResolvers({ schemaName }))),
      Upload: GraphQLUpload,
    };
    return filterValues(resolvers, o => Object.entries(o).length > 0);
  }
}
