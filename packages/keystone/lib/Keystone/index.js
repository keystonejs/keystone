const fs = require('fs');
const gql = require('graphql-tag');
const flattenDeep = require('lodash.flattendeep');
const fastMemoize = require('fast-memoize');
const falsey = require('falsey');
const createCorsMiddleware = require('cors');
const { print } = require('graphql/language/printer');
const { graphql } = require('graphql');
const {
  resolveAllKeys,
  arrayToObject,
  mapKeys,
  objMerge,
  flatten,
  unique,
  filterValues,
  compose,
} = require('@keystonejs/utils');
const {
  validateFieldAccessControl,
  validateListAccessControl,
  validateCustomAccessControl,
  validateAuthAccessControl,
} = require('@keystonejs/access-control');
const {
  startAuthedSession,
  endAuthedSession,
  commonSessionMiddleware,
} = require('@keystonejs/session');

const {
  unmergeRelationships,
  createRelationships,
  mergeRelationships,
} = require('./relationship-utils');
const List = require('../List');
const { DEFAULT_DIST_DIR } = require('../../constants');
const {
  CustomProvider,
  ListAuthProvider,
  ListCRUDProvider,
  VersionProvider,
} = require('../providers');

module.exports = class Keystone {
  constructor({
    defaultAccess,
    adapters,
    adapter,
    defaultAdapter,
    name,
    onConnect,
    cookieSecret = 'qwerty',
    sessionStore,
    queryLimits = {},
    secureCookies = process.env.NODE_ENV === 'production', // Default to true in production
    cookieMaxAge = 1000 * 60 * 60 * 24 * 30, // 30 days
    schemaNames = ['public'],
    appVersion = {
      version: '1.0.0',
      addVersionToHttpHeaders: true,
      access: true,
    },
  }) {
    this.name = name;
    this.defaultAccess = { list: true, field: true, custom: true, ...defaultAccess };
    this.auth = {};
    this.lists = {};
    this.listsArray = [];
    this.getListByKey = key => this.lists[key];
    this._schemas = {};
    this._cookieSecret = cookieSecret;
    this._secureCookies = secureCookies;
    this._cookieMaxAge = cookieMaxAge;
    this._sessionStore = sessionStore;
    this.eventHandlers = { onConnect };
    this.registeredTypes = new Set();
    this._schemaNames = schemaNames;
    this.appVersion = appVersion;

    this._listCRUDProvider = new ListCRUDProvider();
    this._customProvider = new CustomProvider({
      schemaNames,
      defaultAccess: this.defaultAccess,
      buildQueryHelper: this._buildQueryHelper,
    });
    this._providers = [
      this._listCRUDProvider,
      this._customProvider,
      new VersionProvider({ appVersion, schemaNames }),
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

    // Placeholder until keystone.prepare() is run during which this function
    // will be replaced with one that can actually make queries (assuming the
    // graphql app is setup, which is checked for elsewhere).
    this.executeQuery = () => {
      throw new Error(
        'Attempted to execute keystone.query() before keystone.prepare() has completed.'
      );
    };
  }

  getCookieSecret() {
    if (!this._cookieSecret) {
      throw new Error('No cookieSecret set in Keystone constructor');
    }
    return this._cookieSecret;
  }

  _executeOperation({
    requestString,
    rootValue = null,
    contextValue,
    variableValues,
    operationName,
  }) {
    // This method is a thin wrapper around the graphql() function which uses
    // contextValue.schemaName to select a schema created by app-graphql to execute.
    // https://graphql.org/graphql-js/graphql/#graphql
    const schema = this._schemas[contextValue.schemaName];
    if (!schema) {
      return Promise.reject(
        new Error(
          `No executable schema named '${contextValue.schemaName}' is available. Have you setup '@keystonejs/app-graphql'?`
        )
      );
    }
    return graphql(schema, requestString, rootValue, contextValue, variableValues, operationName);
  }

  // The GraphQL App uses this method to build up the context required for each
  // incoming query.
  // It is also used for generating the `keystone.query` method
  getGraphQlContext({ schemaName, req = {}, skipAccessControl = false } = {}) {
    let getCustomAccessControlForUser;
    let getListAccessControlForUser;
    let getFieldAccessControlForUser;
    let getAuthAccessControlForUser;

    if (skipAccessControl) {
      getCustomAccessControlForUser = () => true;
      getListAccessControlForUser = () => true;
      getFieldAccessControlForUser = () => true;
      getAuthAccessControlForUser = () => true;
    } else {
      // memoizing to avoid requests that hit the same type multiple times.
      // We do it within the request callback so we can resolve it based on the
      // request info ( like who's logged in right now, etc)
      getCustomAccessControlForUser = fastMemoize(access => {
        return validateCustomAccessControl({
          access: access[schemaName],
          authentication: { item: req.user, listKey: req.authedListKey },
        });
      });

      getListAccessControlForUser = fastMemoize(
        (listKey, originalInput, operation, { gqlName, itemId, itemIds } = {}) => {
          return validateListAccessControl({
            access: this.lists[listKey].access[schemaName],
            originalInput,
            operation,
            authentication: { item: req.user, listKey: req.authedListKey },
            listKey,
            gqlName,
            itemId,
            itemIds,
          });
        }
      );

      getFieldAccessControlForUser = fastMemoize(
        (
          listKey,
          fieldKey,
          originalInput,
          existingItem,
          operation,
          { gqlName, itemId, itemIds } = {}
        ) => {
          return validateFieldAccessControl({
            access: this.lists[listKey].fieldsByPath[fieldKey].access[schemaName],
            originalInput,
            existingItem,
            operation,
            authentication: { item: req.user, listKey: req.authedListKey },
            fieldKey,
            listKey,
            gqlName,
            itemId,
            itemIds,
          });
        }
      );

      getAuthAccessControlForUser = fastMemoize((listKey, { gqlName } = {}) => {
        return validateAuthAccessControl({
          access: this.lists[listKey].access[schemaName],
          authentication: { item: req.user, listKey: req.authedListKey },
          listKey,
          gqlName,
        });
      });
    }

    return {
      schemaName,
      startAuthedSession: ({ item, list }, audiences) =>
        startAuthedSession(req, { item, list }, audiences, this._cookieSecret),
      endAuthedSession: endAuthedSession.bind(null, req),
      authedItem: req.user,
      authedListKey: req.authedListKey,
      getCustomAccessControlForUser,
      getListAccessControlForUser,
      getFieldAccessControlForUser,
      getAuthAccessControlForUser,
      totalResults: 0,
      maxTotalResults: this.queryLimits.maxTotalResults,
    };
  }

  /**
   * A factory for generating executable graphql query functions.
   *
   * @param context Object The graphQL Context object
   * @param context.schemaName String Usually 'admin', this is the registered
   * schema as passed to keystone.registerSchema()
   *
   * @return Function An executable function for running a query
   */
  _buildQueryHelper(defaultContext) {
    /**
     * An executable function for running a query
     *
     * @param requestString String A graphQL query string
     * @param options.skipAccessControl Boolean By default access control _of
     * the user making the initial request_ is still tested. Disable all
     * Access Control checks with this flag
     * @param options.variables Object The variables passed to the graphql
     * query for the given queryString.
     * @param options.context Object Overrides to the default context used when
     * making a query. Useful for setting the `schemaName` for example.
     *
     * @return Promise<Object> The graphql query response
     */
    return (
      requestString,
      { skipAccessControl = false, variables, context = {}, operationName } = {}
    ) => {
      let contextValue = { ...defaultContext, ...context };

      if (skipAccessControl) {
        contextValue.getCustomAccessControlForUser = () => true;
        contextValue.getListAccessControlForUser = () => true;
        contextValue.getFieldAccessControlForUser = () => true;
        contextValue.getAuthAccessControlForUser = () => true;
      }

      return this._executeOperation({
        contextValue,
        requestString,
        variableValues: variables,
        operationName,
      });
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

    const list = new List(key, compose(config.plugins || [])(config), {
      getListByKey,
      queryHelper: this._buildQueryHelper.bind(this),
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
    });
    this.lists[key] = list;
    this.listsArray.push(list);
    this._listCRUDProvider.lists.push(list);
    list.initFields();
    return list;
  }

  extendGraphQLSchema({ types = [], queries = [], mutations = [] }) {
    return this._customProvider.extendGraphQLSchema({ types, queries, mutations });
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
  }

  /**
   * @return Promise<null>
   */
  connect() {
    const { adapters, name } = this;
    return resolveAllKeys(mapKeys(adapters, adapter => adapter.connect({ name }))).then(() => {
      if (this.eventHandlers.onConnect) {
        return this.eventHandlers.onConnect(this);
      }
    });
  }

  /**
   * @return Promise<null>
   */
  disconnect() {
    return resolveAllKeys(
      mapKeys(this.adapters, adapter => adapter.disconnect())
      // Chain an empty function so that the result of this promise
      // isn't unintentionally leaked to the caller
    ).then(() => {});
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

    return { lists, name: this.name };
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
    // Fields can be represented multiple times within and between lists.
    // If a field defines a `getGqlAuxTypes()` method, it will be
    // duplicated.
    // graphql-tools will blow up (rightly so) on duplicated types.
    // Deduping here avoids that problem.
    return [
      ...unique(flatten(this._providers.map(p => p.getTypes({ schemaName })))),
      queries.length > 0 && `type Query { ${queries.join('\n')} }`,
      mutations.length > 0 && `type Mutation { ${mutations.join('\n')} }`,
    ]
      .filter(s => s)
      .map(s => print(gql(s)));
  }

  getResolvers({ schemaName }) {
    // Like the `typeDefs`, we want to dedupe the resolvers. We rely on the
    // semantics of the JS spread operator here (duplicate keys are overridden
    // - first one wins)
    // TODO: Document this order of precendence, because it's not obvious, and
    // there's no errors thrown
    // TODO: console.warn when duplicate keys are detected?
    return filterValues(
      {
        // Order of spreading is important here - we don't want user-defined types
        // to accidentally override important things like `Query`.
        ...objMerge(this._providers.map(p => p.getTypeResolvers({ schemaName }))),
        Query: objMerge(this._providers.map(p => p.getQueryResolvers({ schemaName }))),
        Mutation: objMerge(this._providers.map(p => p.getMutationResolvers({ schemaName }))),
      },
      o => Object.entries(o).length > 0
    );
  }

  dumpSchema(file, schemaName) {
    // The 'Upload' scalar is normally automagically added by Apollo Server
    // See: https://blog.apollographql.com/file-uploads-with-apollo-server-2-0-5db2f3f60675
    // Since we don't execute apollo server over this schema, we have to
    // reinsert it.
    const schema = `
      scalar Upload
      ${this.getTypeDefs({ schemaName }).join('\n')}
    `;
    fs.writeFileSync(file, schema);
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

  async prepare({
    dev = false,
    apps = [],
    distDir,
    pinoOptions,
    cors = { origin: true, credentials: true },
  } = {}) {
    this._consolidateRelationships();
    const middlewares = flattenDeep([
      this.appVersion.addVersionToHttpHeaders &&
        ((req, res, next) => {
          res.set('X-Keystone-App-Version', this.appVersion.version);
          next();
        }),
      // Used by other middlewares such as authentication strategies. Important
      // to be first so the methods added to `req` are available further down
      // the request pipeline.
      // TODO: set up a session test rig (maybe by wrapping an in-memory store)
      commonSessionMiddleware({
        keystone: this,
        cookieSecret: this._cookieSecret,
        sessionStore: this._sessionStore,
        secureCookies: this._secureCookies,
        cookieMaxAge: this._cookieMaxAge,
      }),
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

    // Now that the middlewares are done, it's safe to assume all the schemas
    // are registered, so we can setup our query helper
    // This enables god-mode queries with no access control checks
    this.executeQuery = this._buildQueryHelper(
      this.getGraphQlContext({
        skipAccessControl: true,
        // This is for backwards compatibility with single-schema Keystone
        schemaName: this._schemaNames.length === 1 ? this._schemaNames[0] : undefined,
      })
    );

    return { middlewares };
  }
};
