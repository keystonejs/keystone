const GraphQLJSON = require('graphql-type-json');
const gql = require('graphql-tag');
const { print } = require('graphql/language/printer');
const { resolveAllKeys, arrayToObject, mapKeys, objMerge, flatten } = require('@voussoir/utils');

const {
  unmergeRelationships,
  createRelationships,
  mergeRelationships,
} = require('./relationship-utils');
const List = require('../List');
const bindSession = require('./session');

const unique = arr => [...new Set(arr)];

const debugGraphQLSchemas = () => !!process.env.DEBUG_GRAPHQL_SCHEMAS;

module.exports = class Keystone {
  constructor(config) {
    this.config = {
      ...config,
    };
    this.defaultAccess = { list: true, field: true, ...config.defaultAccess };
    this.auth = {};
    this.lists = {};
    this.listsArray = [];
    this.getListByKey = key => this.lists[key];
    this.session = bindSession(this);

    if (config.adapters) {
      this.adapters = config.adapters;
      this.defaultAdapter = config.defaultAdapter;
    } else if (config.adapter) {
      this.adapters = { [config.adapter.constructor.name]: config.adapter };
      this.defaultAdapter = config.adapter.constructor.name;
    } else {
      throw new Error('Need an adapter, yo');
    }
  }
  createAuthStrategy(options) {
    const { type: StrategyType, list: listKey, config } = options;
    const { authType } = StrategyType;
    if (!this.auth[listKey]) {
      this.auth[listKey] = {};
    }
    const strategy = new StrategyType(this, listKey, config);
    strategy.authType = authType;
    this.auth[listKey][authType] = strategy;
    return strategy;
  }
  createList(key, config) {
    const { getListByKey, adapters } = this;
    const adapterName = config.adapterName || this.defaultAdapter;
    const list = new List(key, config, {
      getListByKey,
      adapter: adapters[adapterName],
      defaultAccess: this.defaultAccess,
      getAuth: () => this.auth[key],
    });
    this.lists[key] = list;
    this.listsArray.push(list);
  }

  /**
   * @return Promise<null>
   */
  connect(to, options) {
    const {
      adapters,
      config: { name, dbName, adapterConnectOptions },
    } = this;

    return resolveAllKeys(
      mapKeys(adapters, adapter =>
        adapter.connect(
          to,
          {
            name,
            dbName,
            ...adapterConnectOptions,
            ...options,
          }
        )
      )
      // Don't unnecessarily leak any connection info
    ).then(() => {});
  }

  /**
   * @return Promise<null>
   */
  disconnect() {
    return resolveAllKeys(
      mapKeys(this.adapters, adapter => adapter.disconnect())
      // Don't unnecessarily leak any connection info
    ).then(() => {});
  }

  getAdminMeta() {
    const { name } = this.config;
    // We've consciously made a design choice that the `read` permission on a
    // list is a master switch in the Admin UI (not the GraphQL API).
    // Justification: If you want to Create without the Read permission, you
    // technically don't have permission to read the result of your creation.
    // If you want to Update an item, you can't see what the current values
    // are. If you want to delete an item, you'd need to be given direct
    // access to it (direct URI), but can't see anything about that item. And
    // in fact, being able to load a page with a 'delete' button on it
    // violates the read permission as it leaks the fact that item exists.
    // In all these cases, the Admin UI becomes unnecessarily complex.
    // So we only allow all these actions if you also have read access.
    const lists = arrayToObject(this.listsArray.filter(list => list.access.read), 'key', list =>
      list.getAdminMeta()
    );

    return { lists, name };
  }

  getTypeDefs() {
    // Fields can be represented multiple times within and between lists.
    // If a field defines a `gqlAuxTypes()` method, it will be
    // duplicated.
    // graphql-tools will blow up (rightly so) on duplicated types.
    // Deduping here avoids that problem.
    return [
      ...unique(flatten(this.listsArray.map(list => list.gqlTypes))),
      `"""NOTE: Can be JSON, or a Boolean/Int/String
          Why not a union? GraphQL doesn't support a union including a scalar
          (https://github.com/facebook/graphql/issues/215)"""
       scalar JSON`,
      `type _ListAccess {
          """Access Control settings for the currently logged in (or anonymous)
             user when performing 'create' operations.
             NOTE: 'create' can only return a Boolean.
             It is not possible to specify a declarative Where clause for this
             operation"""
          create: Boolean

          """Access Control settings for the currently logged in (or anonymous)
             user when performing 'read' operations."""
          read: JSON

          """Access Control settings for the currently logged in (or anonymous)
             user when performing 'update' operations."""
          update: JSON

          """Access Control settings for the currently logged in (or anonymous)
             user when performing 'delete' operations."""
          delete: JSON
       }`,
      `type _ListMeta {
          access: _ListAccess
       }`,
      `type _QueryMeta {
          count: Int
       }`,
      `type Query {
          ${unique(flatten(this.listsArray.map(list => list.gqlQueries))).join('\n')}
       }`,
      `type Mutation {
          ${unique(flatten(this.listsArray.map(list => list.gqlMutations))).join('\n')}
       }`,
    ].map(s => print(gql(s)));
  }

  getAdminSchema() {
    const typeDefs = this.getTypeDefs();
    if (debugGraphQLSchemas()) {
      typeDefs.forEach(i => console.log(i));
    }

    const queryMetaResolver = {
      // meta is passed in from the list's resolver (eg; '_allUsersMeta')
      count: meta => meta.getCount(),
    };

    const listMetaResolver = {
      // meta is passed in from the list's resolver (eg; '_allUsersMeta')
      access: meta => meta.getAccess(),
    };

    const listAccessResolver = {
      // access is passed in from the listMetaResolver
      create: access => access.getCreate(),
      read: access => access.getRead(),
      update: access => access.getUpdate(),
      delete: access => access.getDelete(),
    };

    // Like the `typeDefs`, we want to dedupe the resolvers. We rely on the
    // semantics of the JS spread operator here (duplicate keys are overridden
    // - first one wins)
    // TODO: Document this order of precendence, becaut it's not obvious, and
    // there's no errors thrown
    // TODO: console.warn when duplicate keys are detected?
    const resolvers = {
      // Order of spreading is important here - we don't want user-defined types
      // to accidentally override important things like `Query`.
      ...objMerge(this.listsArray.map(list => list.gqlAuxFieldResolvers)),
      ...objMerge(this.listsArray.map(list => list.gqlFieldResolvers)),

      JSON: GraphQLJSON,

      _QueryMeta: queryMetaResolver,
      _ListMeta: listMetaResolver,
      _ListAccess: listAccessResolver,

      Query: {
        // Order is also important here, any TypeQuery's defined by types
        // shouldn't be able to override list-level queries
        ...objMerge(this.listsArray.map(list => list.gqlAuxQueryResolvers)),
        ...objMerge(this.listsArray.map(list => list.gqlQueryResolvers)),
      },

      Mutation: {
        ...objMerge(this.listsArray.map(list => list.gqlAuxMutationResolvers)),
        ...objMerge(this.listsArray.map(list => list.gqlMutationResolvers)),
      },
    };

    if (debugGraphQLSchemas()) {
      console.log(resolvers);
    }

    return { typeDefs, resolvers };
  }

  getListAccessControl({ listKey, operation, authentication }) {
    return this.lists[listKey].getAccessControl({ operation, authentication });
  }

  getFieldAccessControl({ item, listKey, fieldKey, operation, authentication }) {
    return this.lists[listKey].getFieldAccessControl({
      item,
      fieldKey,
      operation,
      authentication,
    });
  }

  createItem(listKey, itemData) {
    return this.lists[listKey].adapter.create(itemData);
  }

  async createItems(itemsToCreate) {
    const createItems = data => {
      return resolveAllKeys(
        mapKeys(data, (value, list) => Promise.all(value.map(item => this.createItem(list, item))))
      );
    };

    const cleanupItems = createdItems =>
      Promise.all(
        Object.keys(createdItems).map(listKey =>
          Promise.all(createdItems[listKey].map(({ id }) => this.lists[listKey].adapter.delete(id)))
        )
      );

    // 1. Split it apart
    const { relationships, data } = unmergeRelationships(this.lists, itemsToCreate);
    // 2. Create the items
    // NOTE: Only works if all relationships fields are non-"required"
    const createdItems = await createItems(data);

    let createdRelationships;
    try {
      // 3. Create the relationships
      createdRelationships = await createRelationships(this.lists, relationships, createdItems);
    } catch (error) {
      // 3.5. If creation of relationships didn't work, unwind the createItems
      cleanupItems(createdItems);
      // Re-throw the error now that we've cleaned up
      throw error;
    }

    // 4. Merge the data back together again
    return mergeRelationships(createdItems, createdRelationships);
  }
};
