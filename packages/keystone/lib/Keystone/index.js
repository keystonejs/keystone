const { gql } = require('apollo-server-express');
const memoize = require('micro-memoize');
const { GraphQLUpload } = require('graphql-upload');
const { objMerge, flatten, unique, filterValues } = require('@keystone-next/utils-legacy');
const {
  validateFieldAccessControl,
  validateListAccessControl,
  validateAuthAccessControl,
} = require('@keystone-next/access-control-legacy');

const { List } = require('../ListTypes');
const { ListCRUDProvider } = require('../providers');

// composePlugins([f, g, h])(o, e) = h(g(f(o, e), e), e)
const composePlugins = fns => (o, e) => fns.reduce((acc, fn) => fn(acc, e), o);

module.exports = class Keystone {
  constructor({ defaultAccess, adapter, onConnect, queryLimits = {}, schemaNames = ['public'] }) {
    this.defaultAccess = { list: true, field: true, custom: true, ...defaultAccess };
    this.auth = {};
    this.lists = {};
    this.listsArray = [];
    this.getListByKey = key => this.lists[key];
    this._schemas = {};
    this.eventHandlers = { onConnect };
    this.registeredTypes = new Set();
    this._schemaNames = schemaNames;

    this._listCRUDProvider = new ListCRUDProvider();
    this._providers = [this._listCRUDProvider];

    if (adapter) {
      this.adapter = adapter;
    } else {
      throw new Error('No database adapter provided');
    }

    this.queryLimits = {
      maxTotalResults: Infinity,
      ...queryLimits,
    };
    if (this.queryLimits.maxTotalResults < 1) {
      throw new Error("queryLimits.maxTotalResults can't be < 1");
    }
  }

  _getAccessControlContext({ schemaName, authentication, skipAccessControl }) {
    if (skipAccessControl) {
      return {
        getListAccessControlForUser: () => true,
        getFieldAccessControlForUser: () => true,
        getAuthAccessControlForUser: () => true,
      };
    }
    // memoizing to avoid requests that hit the same type multiple times.
    // We do it within the request callback so we can resolve it based on the
    // request info (like who's logged in right now, etc)
    const getListAccessControlForUser = memoize(
      async (
        access,
        listKey,
        originalInput,
        operation,
        { gqlName, itemId, itemIds, context } = {}
      ) => {
        return validateListAccessControl({
          access: access[schemaName],
          args: {
            originalInput,
            operation,
            authentication: authentication && authentication.item ? authentication : {},
            listKey,
            gqlName,
            itemId,
            itemIds,
            context,
          },
        });
      },
      { isPromise: true }
    );

    const getFieldAccessControlForUser = memoize(
      async (
        access,
        listKey,
        fieldKey,
        originalInput,
        existingItem,
        operation,
        { gqlName, itemId, itemIds, context } = {}
      ) => {
        return validateFieldAccessControl({
          access: access[schemaName],
          args: {
            originalInput,
            existingItem,
            operation,
            authentication: authentication && authentication.item ? authentication : {},
            fieldKey,
            listKey,
            gqlName,
            itemId,
            itemIds,
            context,
          },
        });
      },
      { isPromise: true }
    );

    const getAuthAccessControlForUser = memoize(
      async (access, listKey, { gqlName, context } = {}) => {
        return validateAuthAccessControl({
          access: access[schemaName],
          args: {
            authentication: authentication && authentication.item ? authentication : {},
            listKey,
            gqlName,
            context,
            operation: 'auth',
          },
        });
      },
      { isPromise: true }
    );

    return {
      getListAccessControlForUser,
      getFieldAccessControlForUser,
      getAuthAccessControlForUser,
    };
  }

  createContext({ schemaName = 'public', authentication = {}, skipAccessControl = false } = {}) {
    const context = {
      schemaName,
      authedItem: authentication.item,
      authedListKey: authentication.listKey,
      ...this._getAccessControlContext({ schemaName, authentication, skipAccessControl }),
      totalResults: 0,
      maxTotalResults: this.queryLimits.maxTotalResults,
    };
    // Locally bind the values we use as defaults into an object to make
    // JS behave the way we want.
    const defaults = { schemaName, authentication, skipAccessControl, context };
    context.createContext = ({
      schemaName = defaults.schemaName,
      authentication = defaults.authentication,
      skipAccessControl = defaults.skipAccessControl,
    } = {}) => this.createContext({ schemaName, authentication, skipAccessControl });
    context.sudo = () =>
      this.createContext({ schemaName, authentication, skipAccessControl: true });
    context.gqlNames = listKey => this.lists[listKey].gqlNames;
    return context;
  }

  createList(key, config, { isAuxList = false } = {}) {
    const { getListByKey, adapter } = this;
    const isReservedName = !isAuxList && key[0] === '_';

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

    const list = new List(
      key,
      composePlugins(config.plugins || [])(config, { listKey: key, keystone: this }),
      {
        getListByKey,
        adapter,
        defaultAccess: this.defaultAccess,
        registerType: type => this.registeredTypes.add(type),
        isAuxList,
        createAuxList: (auxKey, auxConfig) => {
          if (isAuxList) {
            throw new Error(
              `Aux list "${key}" shouldn't be creating more aux lists ("${auxKey}"). Something's probably not right here.`
            );
          }
          return this.createList(auxKey, auxConfig, { isAuxList: true });
        },
        schemaNames: this._schemaNames,
      }
    );
    this.lists[key] = list;
    this.listsArray.push(list);
    this._listCRUDProvider.lists.push(list);
    list.initFields();
    return list;
  }

  _consolidateRelationships() {
    const rels = {};
    const otherSides = {};
    this.listsArray.forEach(list => {
      list.fields
        .filter(f => f.isRelationship)
        .forEach(f => {
          const myRef = `${f.listKey}.${f.path}`;
          if (otherSides[myRef]) {
            // I'm already there, go and update rels[otherSides[myRef]] with my info
            rels[otherSides[myRef]].right = f;

            // Make sure I'm actually referencing the thing on the left
            const { left } = rels[otherSides[myRef]];
            if (f.config.ref !== `${left.listKey}.${left.path}`) {
              throw new Error(
                `${myRef} refers to ${f.config.ref}. Expected ${left.listKey}.${left.path}`
              );
            }
          } else {
            // Got us a new relationship!
            rels[myRef] = { left: f };
            if (f.refFieldPath) {
              // Populate otherSides
              otherSides[f.config.ref] = myRef;
            }
          }
        });
    });
    // See if anything failed to link up.
    const badRel = Object.values(rels).find(({ left, right }) => left.refFieldPath && !right);
    if (badRel) {
      const { left } = badRel;
      throw new Error(
        `${left.listKey}.${left.path} refers to a non-existant field, ${left.config.ref}`
      );
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
      let cardinality;
      if (left.config.many) {
        if (right) {
          if (right.config.many) {
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
          if (right.config.many) {
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
          const rightKey = `${left.config.ref}`;
          rel.columnNames = {
            [leftKey]: { near: `${left.listKey}_left_id`, far: `${left.config.ref}_right_id` },
            [rightKey]: { near: `${left.config.ref}_right_id`, far: `${left.listKey}_left_id` },
          };
        }
      } else if (cardinality === '1:1') {
        tableName = left.listKey;
        columnName = left.path;
      } else if (cardinality === '1:N') {
        tableName = right.listKey;
        columnName = right.path;
      } else {
        tableName = left.listKey;
        columnName = left.path;
      }
      rel.tableName = tableName;
      rel.columnName = columnName;
    });

    return Object.values(rels);
  }

  /**
   * Connects to the database via the given adapter(s)
   *
   * @return Promise<any> the result of executing `onConnect` as passed to the
   * constructor, or `undefined` if no `onConnect` method specified.
   */
  async connect(args) {
    await this.adapter.connect({ rels: this._consolidateRelationships() });

    if (this.eventHandlers.onConnect) {
      return this.eventHandlers.onConnect(this, args);
    }
  }

  /**
   * @return Promise<null>
   */
  async disconnect() {
    await this.adapter.disconnect();
  }

  getTypeDefs({ schemaName }) {
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

  getResolvers({ schemaName }) {
    // Like the `typeDefs`, we want to dedupe the resolvers. We rely on the
    // semantics of the JS spread operator here (duplicate keys are overridden
    // - last one wins)
    // TODO: Document this order of precedence, because it's not obvious, and
    // there's no errors thrown
    // TODO: console.warn when duplicate keys are detected?
    return filterValues(
      {
        // Order of spreading is important here - we don't want user-defined types
        // to accidentally override important things like `Query`.
        ...objMerge(this._providers.map(p => p.getTypeResolvers({ schemaName }))),
        Query: objMerge(this._providers.map(p => p.getQueryResolvers({ schemaName }))),
        Mutation: objMerge(this._providers.map(p => p.getMutationResolvers({ schemaName }))),
        Subscription: objMerge(
          this._providers.map(p => p.getSubscriptionResolvers({ schemaName }))
        ),
        Upload: GraphQLUpload,
      },
      o => Object.entries(o).length > 0
    );
  }
};
