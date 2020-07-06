const gql = require('graphql-tag');
const flattenDeep = require('lodash.flattendeep');
const memoize = require('micro-memoize');
const falsey = require('falsey');
const createCorsMiddleware = require('cors');
const { execute, print } = require('graphql');
const {
  resolveAllKeys,
  arrayToObject,
  mapKeys,
  objMerge,
  flatten,
  unique,
  filterValues,
} = require('@keystonejs/utils');
const {
  validateFieldAccessControl,
  validateListAccessControl,
  validateCustomAccessControl,
  validateAuthAccessControl,
} = require('@keystonejs/access-control');
const { SessionManager } = require('@keystonejs/session');
const { AppVersionProvider, appVersionMiddleware } = require('@keystonejs/app-version');

const {
  unmergeRelationships,
  createRelationships,
  mergeRelationships,
} = require('./relationship-utils');
const { List } = require('../ListTypes');
const { DEFAULT_DIST_DIR } = require('../../constants');
const { CustomProvider, ListAuthProvider, ListCRUDProvider } = require('../providers');

module.exports = class Keystone {
  constructor({
    defaultAccess,
    adapters,
    adapter,
    defaultAdapter,
    onConnect,
    cookieSecret,
    sessionStore,
    queryLimits = {},
    cookie = {
      secure: process.env.NODE_ENV === 'production', // Default to true in production
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      sameSite: false,
    },
    schemaNames = ['public'],
    appVersion = {
      version: '1.0.0',
      addVersionToHttpHeaders: true,
      access: true,
    },
  }) {
    this.defaultAccess = { list: true, field: true, custom: true, ...defaultAccess };
    this.auth = {};
    this.lists = {};
    this.listsArray = [];
    this.getListByKey = key => this.lists[key];
    this._schemas = {};
    this._sessionManager = new SessionManager({
      cookieSecret,
      cookie,
      sessionStore,
    });
    this.eventHandlers = { onConnect };
    this.registeredTypes = new Set();
    this._schemaNames = schemaNames;
    this.appVersion = appVersion;

    this._listCRUDProvider = new ListCRUDProvider();
    this._customProvider = new CustomProvider({ schemaNames, defaultAccess: this.defaultAccess });
    this._providers = [
      this._listCRUDProvider,
      this._customProvider,
      new AppVersionProvider({
        version: appVersion.version,
        access: appVersion.access,
        schemaNames,
      }),
    ];

    if (adapters) {
      this.adapters = adapters;
      this.defaultAdapter = defaultAdapter;
    } else if (adapter) {
      this.adapters = { [adapter.constructor.name]: adapter };
      this.defaultAdapter = adapter.constructor.name;
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
        getCustomAccessControlForUser: () => true,
        getListAccessControlForUser: () => true,
        getFieldAccessControlForUser: () => true,
        getAuthAccessControlForUser: () => true,
      };
    }
    // memoizing to avoid requests that hit the same type multiple times.
    // We do it within the request callback so we can resolve it based on the
    // request info (like who's logged in right now, etc)
    const getCustomAccessControlForUser = memoize(
      async (item, args, context, info, access, gqlName) => {
        return validateCustomAccessControl({
          item,
          args,
          context,
          info,
          access: access[schemaName],
          authentication,
          gqlName,
        });
      },
      { isPromise: true }
    );

    const getListAccessControlForUser = memoize(
      async (listKey, originalInput, operation, { gqlName, itemId, itemIds, context } = {}) => {
        return validateListAccessControl({
          access: this.lists[listKey].access[schemaName],
          originalInput,
          operation,
          authentication,
          listKey,
          gqlName,
          itemId,
          itemIds,
          context,
        });
      },
      { isPromise: true }
    );

    const getFieldAccessControlForUser = memoize(
      async (
        listKey,
        fieldKey,
        originalInput,
        existingItem,
        operation,
        { gqlName, itemId, itemIds, context } = {}
      ) => {
        return validateFieldAccessControl({
          access: this.lists[listKey].fieldsByPath[fieldKey].access[schemaName],
          originalInput,
          existingItem,
          operation,
          authentication,
          fieldKey,
          listKey,
          gqlName,
          itemId,
          itemIds,
          context,
        });
      },
      { isPromise: true }
    );

    const getAuthAccessControlForUser = memoize(
      async (listKey, { gqlName, context } = {}) => {
        return validateAuthAccessControl({
          access: this.lists[listKey].access[schemaName],
          authentication,
          listKey,
          gqlName,
          context,
        });
      },
      { isPromise: true }
    );

    return {
      getCustomAccessControlForUser,
      getListAccessControlForUser,
      getFieldAccessControlForUser,
      getAuthAccessControlForUser,
    };
  }

  createContext({ schemaName = 'public', authentication = {}, skipAccessControl = false }) {
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
    }) => this.createContext({ schemaName, authentication, skipAccessControl });
    context.executeGraphQL = ({ context = defaults.context, query, variables }) =>
      this.executeGraphQL({ context, query, variables });
    return context;
  }

  executeGraphQL({ context, query, variables }) {
    if (!context) {
      context = this.createContext({});
    }

    const schema = this._schemas[context.schemaName];
    if (!schema) {
      throw new Error(
        `No executable schema named '${context.schemaName}' is available. Have you setup '@keystonejs/app-graphql'?`
      );
    }

    if (typeof query === 'string') {
      query = gql(query);
    }

    return execute(schema, query, null, context, variables);
  }

  createHTTPContext({ schemaName, req }) {
    // The GraphQL App uses this method to build up the context required for each incoming query.
    return {
      ...this.createContext({
        schemaName,
        authentication: { item: req.user, listKey: req.authedListKey },
        skipAccessControl: false,
      }),
      ...this._sessionManager.getContext(req),
      req,
    };
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
    if (!this.lists[listKey]) {
      throw new Error(`List "${listKey}" does not exist.`);
    }
    this._providers.push(
      new ListAuthProvider({ list: this.lists[listKey], authStrategy: strategy })
    );
    return strategy;
  }

  createList(key, config, { isAuxList = false } = {}) {
    const { getListByKey, adapters } = this;
    const adapterName = config.adapterName || this.defaultAdapter;
    const isReservedName = !isAuxList && key[0] === '_';

    if (isReservedName) {
      throw new Error(`Invalid list name "${key}". List names cannot start with an underscore.`);
    }

    // composePlugins([f, g, h])(o, e) = h(g(f(o, e), e), e)
    const composePlugins = fns => (o, e) => fns.reduce((acc, fn) => fn(acc, e), o);

    const list = new List(
      key,
      composePlugins(config.plugins || [])(config, { listKey: key, keystone: this }),
      {
        getListByKey,
        adapter: adapters[adapterName],
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

  extendGraphQLSchema({ types = [], queries = [], mutations = [], subscriptions = [] }) {
    return this._customProvider.extendGraphQLSchema({ types, queries, mutations, subscriptions });
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
  async connect() {
    const { adapters } = this;
    const rels = this._consolidateRelationships();
    await resolveAllKeys(mapKeys(adapters, adapter => adapter.connect({ rels })));

    if (this.eventHandlers.onConnect) {
      return this.eventHandlers.onConnect(this);
    }
  }

  /**
   * @return Promise<null>
   */
  async disconnect() {
    await resolveAllKeys(mapKeys(this.adapters, adapter => adapter.disconnect()));
  }

  getAdminMeta({ schemaName }) {
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
    const lists = arrayToObject(
      this.listsArray.filter(list => list.access[schemaName].read && !list.isAuxList),
      'key',
      list => list.getAdminMeta({ schemaName })
    );

    return { lists };
  }

  getAdminViews({ schemaName }) {
    return {
      listViews: arrayToObject(
        this.listsArray.filter(list => list.access[schemaName].read && !list.isAuxList),
        'key',
        list => list.views
      ),
    };
  }

  // It's not Keystone core's responsibility to create an executable schema, but
  // once one is, Keystone wants to be able to expose the ability to query that
  // schema, so this function enables other modules to register that function.
  registerSchema(schemaName, schema) {
    this._schemas[schemaName] = schema;
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
      },
      o => Object.entries(o).length > 0
    );
  }

  dumpSchema(schemaName = 'public') {
    // The 'Upload' scalar is normally automagically added by Apollo Server
    // See: https://blog.apollographql.com/file-uploads-with-apollo-server-2-0-5db2f3f60675
    // Since we don't execute apollo server over this schema, we have to reinsert it.
    return ['scalar Upload', ...this.getTypeDefs({ schemaName }).map(t => print(t))].join('\n');
  }

  createItem(listKey, itemData) {
    return this.lists[listKey].adapter.create(itemData);
  }

  async createItems(itemsToCreate) {
    // 1. Split it apart
    const { relationships, data } = unmergeRelationships(this.lists, itemsToCreate);
    // 2. Create the items
    // NOTE: Only works if all relationships fields are non-"required"
    const createdItems = await resolveAllKeys(
      mapKeys(data, (items, listKey) =>
        Promise.all(items.map(itemData => this.createItem(listKey, itemData)))
      )
    );

    let createdRelationships;
    try {
      // 3. Create the relationships
      createdRelationships = await createRelationships(this.lists, relationships, createdItems);
    } catch (error) {
      // 3.5. If creation of relationships didn't work, unwind the createItems
      Promise.all(
        Object.entries(createdItems).map(([listKey, items]) =>
          Promise.all(items.map(({ id }) => this.lists[listKey].adapter.delete(id)))
        )
      );
      // Re-throw the error now that we've cleaned up
      throw error;
    }

    // 4. Merge the data back together again
    return mergeRelationships(createdItems, createdRelationships);
  }

  async _prepareMiddlewares({ dev, apps, distDir, pinoOptions, cors }) {
    return flattenDeep([
      this.appVersion.addVersionToHttpHeaders && appVersionMiddleware(this.appVersion.version),
      // Used by other middlewares such as authentication strategies. Important
      // to be first so the methods added to `req` are available further down
      // the request pipeline.
      // TODO: set up a session test rig (maybe by wrapping an in-memory store)
      this._sessionManager.getSessionMiddleware({ keystone: this }),
      falsey(process.env.DISABLE_LOGGING) && require('express-pino-logger')(pinoOptions),
      cors && createCorsMiddleware(cors),
      ...(await Promise.all(
        [
          // Inject any field middlewares (eg; WYSIWIG's static assets)
          // We do this first to avoid it conflicting with any catch-all routes the
          // user may have specified
          ...this.registeredTypes,
          ...flattenDeep(
            Object.values(this.auth).map(authStrategies => Object.values(authStrategies))
          ),
          ...apps,
        ]
          .filter(({ prepareMiddleware } = {}) => !!prepareMiddleware)
          .map(app =>
            app.prepareMiddleware({
              keystone: this,
              dev,
              distDir: distDir || DEFAULT_DIST_DIR,
            })
          )
      )),
    ]).filter(middleware => !!middleware);
  }

  async prepare({
    dev = false,
    apps = [],
    distDir,
    pinoOptions,
    cors = { origin: true, credentials: true },
  } = {}) {
    const middlewares = await this._prepareMiddlewares({ dev, apps, distDir, pinoOptions, cors });
    // These function can't be called after prepare(), so make them throw an error from now on.
    ['extendGraphQLSchema', 'createList', 'createAuthStrategy'].forEach(f => {
      this[f] = () => {
        throw new Error(`keystone.${f} must be called before keystone.prepare()`);
      };
    });

    return { middlewares };
  }
};
