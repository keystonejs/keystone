const GraphQLJSON = require('graphql-type-json');
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
  parseCustomAccess,
} = require('@keystonejs/access-control');
const {
  startAuthedSession,
  endAuthedSession,
  commonSessionMiddleware,
} = require('@keystonejs/session');
const { logger } = require('@keystonejs/logger');

const {
  unmergeRelationships,
  createRelationships,
  mergeRelationships,
} = require('./relationship-utils');
const List = require('../List');
const { DEFAULT_DIST_DIR } = require('../../constants');
const { AccessDeniedError } = require('../List/graphqlErrors');

const debugGraphQLSchemas = () => !!process.env.DEBUG_GRAPHQL_SCHEMAS;

const graphqlLogger = logger('graphql');

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
  }) {
    this.name = name;
    this.defaultAccess = { list: true, field: true, custom: true, ...defaultAccess };
    this.auth = {};
    this.lists = {};
    this.listsArray = [];
    this.getListByKey = key => this.lists[key];
    this._extendedTypes = [];
    this._extendedQueries = [];
    this._extendedMutations = [];
    this._graphQLQuery = {};
    this._cookieSecret = cookieSecret;
    this._secureCookies = secureCookies;
    this._cookieMaxAge = cookieMaxAge;
    this._sessionStore = sessionStore;
    this.eventHandlers = { onConnect };
    this.registeredTypes = new Set();
    this._schemaNames = schemaNames;

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

  // The GraphQL App uses this method to build up the context required for each
  // incoming query.
  // It is also used for generating the `keystone.query` method
  getGraphQlContext({ schemaName, req = {}, skipAccessControl = false } = {}) {
    let getCustomAccessControlForUser;
    let getListAccessControlForUser;
    let getFieldAccessControlForUser;

    if (skipAccessControl) {
      getCustomAccessControlForUser = () => true;
      getListAccessControlForUser = () => true;
      getFieldAccessControlForUser = () => true;
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
     * @param queryString String A graphQL query string
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
      queryString,
      { skipAccessControl = false, variables, context = {}, operationName } = {}
    ) => {
      let passThroughContext = {
        ...defaultContext,
        ...context,
      };

      if (skipAccessControl) {
        passThroughContext.getCustomAccessControlForUser = () => true;
        passThroughContext.getListAccessControlForUser = () => true;
        passThroughContext.getFieldAccessControlForUser = () => true;
      }

      const graphQLQuery = this._graphQLQuery[passThroughContext.schemaName];

      if (!graphQLQuery) {
        return Promise.reject(
          new Error(
            `No executable schema named '${passThroughContext.schemaName}' is available. Have you setup '@keystonejs/app-graphql'?`
          )
        );
      }

      return graphQLQuery(queryString, passThroughContext, variables, operationName);
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
      getAuth: () => this.auth[key] || {},
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
    list.initFields();
    return list;
  }

  extendGraphQLSchema({ types = [], queries = [], mutations = [] }) {
    const _parseAccess = obj => ({
      ...obj,
      access: parseCustomAccess({
        access: obj.access,
        schemaNames: this._schemaNames,
        defaultAccess: this.defaultAccess.custom,
      }),
    });

    this._extendedTypes = this._extendedTypes.concat(types.map(_parseAccess));
    this._extendedQueries = this._extendedQueries.concat(queries.map(_parseAccess));
    this._extendedMutations = this._extendedMutations.concat(mutations.map(_parseAccess));
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

  getTypeDefs({ schemaName }) {
    // Aux lists are only there for typing and internal operations, they should
    // not have any GraphQL operations performed on them
    const firstClassLists = this.listsArray.filter(list => !list.isAuxList);

    const mutations = unique(
      flatten([
        ...firstClassLists.map(list => list.getGqlMutations({ schemaName })),
        this._extendedMutations
          .filter(({ access }) => access[schemaName])
          .map(({ schema }) => schema),
      ])
    );

    // Fields can be represented multiple times within and between lists.
    // If a field defines a `getGqlAuxTypes()` method, it will be
    // duplicated.
    // graphql-tools will blow up (rightly so) on duplicated types.
    // Deduping here avoids that problem.
    return [
      ...unique(flatten(this.listsArray.map(list => list.getGqlTypes({ schemaName })))),
      ...unique(
        this._extendedTypes.filter(({ access }) => access[schemaName]).map(({ type }) => type)
      ),
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

          """Access Control settings for the currently logged in (or anonymous)
             user when performing 'auth' operations."""
          auth: JSON
        }`,
      `type _ListSchemaRelatedFields {
        """The typename as used in GraphQL queries"""
        type: String

        """A list of GraphQL field names"""
        fields: [String]
      }`,
      `type _ListSchema {
        """The typename as used in GraphQL queries"""
        type: String

        """Top level GraphQL query names which either return this type, or
           provide aggregate information about this type"""
        queries: [String]

        """Information about fields on other types which return this type, or
           provide aggregate information about this type"""
        relatedFields: [_ListSchemaRelatedFields]
      }`,
      `type _ListMeta {
        """The Keystone List name"""
        name: String

        """Access control configuration for the currently authenticated
           request"""
        access: _ListAccess

        """Information on the generated GraphQL schema"""
        schema: _ListSchema
       }`,
      `type _QueryMeta {
          count: Int
       }`,
      `type Query {
          ${unique(
            flatten([
              ...firstClassLists.map(list => list.getGqlQueries({ schemaName })),
              this._extendedQueries
                .filter(({ access }) => access[schemaName])
                .map(({ schema }) => schema),
            ])
          ).join('\n')}
          """ Retrieve the meta-data for all lists. """
          _ksListsMeta: [_ListMeta]
       }`,
      mutations.length > 0 &&
        `type Mutation {
          ${mutations.join('\n')}
       }`,
    ]
      .filter(s => s)
      .map(s => print(gql(s)));
  }

  // It's not Keystone core's responsibility to create an executable schema, but
  // once one is, Keystone wants to be able to expose the ability to query that
  // schema, so this function enables other modules to register that function.
  registerSchema(schemaName, schema) {
    this._graphQLQuery[schemaName] = (query, context, variables, operationName) =>
      graphql(schema, query, null, context, variables, operationName);
  }

  getAdminSchema({ schemaName }) {
    const typeDefs = this.getTypeDefs({ schemaName });
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
      // schema is
      schema: meta => meta.getSchema(),
    };

    const listAccessResolver = {
      // access is passed in from the listMetaResolver
      create: access => access.getCreate(),
      read: access => access.getRead(),
      update: access => access.getUpdate(),
      delete: access => access.getDelete(),
      auth: access => access.getAuth(),
    };

    // Aux lists are only there for typing and internal operations, they should
    // not have any GraphQL operations performed on them
    const firstClassLists = this.listsArray.filter(list => !list.isAuxList);

    // NOTE: some fields are passed through unchanged from the list, and so are
    // not specified here.
    const listSchemaResolver = {
      // A function so we can lazily evaluate this potentially expensive
      // operation
      // (Could we memoize this in the future?)
      // NOTE: We purposely include the list we're looking for as it may have a
      // self-referential field (eg: User { friends: [User] })
      relatedFields: ({ key }) =>
        firstClassLists
          .map(list => ({
            type: list.gqlNames.outputTypeName,
            fields: flatten(
              list
                .getFieldsRelatedTo(key)
                .filter(field => field.access[schemaName].read)
                .map(field => Object.keys(field.gqlOutputFieldResolvers({ schemaName })))
            ),
          }))
          .filter(({ fields }) => fields.length),
    };

    // Like the `typeDefs`, we want to dedupe the resolvers. We rely on the
    // semantics of the JS spread operator here (duplicate keys are overridden
    // - first one wins)
    // TODO: Document this order of precendence, because it's not obvious, and
    // there's no errors thrown
    // TODO: console.warn when duplicate keys are detected?
    const customResolver = type => ({ schema, resolver, access }) => {
      const gqlName = gql(`type t { ${schema} }`).definitions[0].fields[0].name.value;

      // Perform access control check before passing off control to the
      // user defined resolver (along with the evalutated access).
      const computeAccess = context => {
        const _access = context.getCustomAccessControlForUser(access);
        if (!_access) {
          graphqlLogger.debug({ access, gqlName }, 'Access statically or implicitly denied');
          graphqlLogger.info({ gqlName }, 'Access Denied');
          // If the client handles errors correctly, it should be able to
          // receive partial data (for the fields the user has access to),
          // and then an `errors` array of AccessDeniedError's
          throw new AccessDeniedError({
            data: { type, target: gqlName },
            internalData: {
              authedId: context.authedItem && context.authedItem.id,
              authedListKey: context.authedListKey,
            },
          });
        }
        return _access;
      };
      return {
        [gqlName]: (obj, args, context, info) =>
          resolver(obj, args, context, info, {
            query: this._buildQueryHelper(context),
            access: computeAccess(context),
          }),
      };
    };
    const resolvers = filterValues(
      {
        // Order of spreading is important here - we don't want user-defined types
        // to accidentally override important things like `Query`.
        ...objMerge(this.listsArray.map(list => list.gqlAuxFieldResolvers({ schemaName }))),
        ...objMerge(this.listsArray.map(list => list.gqlFieldResolvers({ schemaName }))),

        JSON: GraphQLJSON,

        _QueryMeta: queryMetaResolver,
        _ListMeta: listMetaResolver,
        _ListAccess: listAccessResolver,
        _ListSchema: listSchemaResolver,

        Query: {
          // Order is also important here, any TypeQuery's defined by types
          // shouldn't be able to override list-level queries
          ...objMerge(firstClassLists.map(list => list.gqlAuxQueryResolvers())),
          ...objMerge(firstClassLists.map(list => list.gqlQueryResolvers({ schemaName }))),
          // And the Keystone meta queries must always be available
          _ksListsMeta: (_, args, context) =>
            this.listsArray
              .filter(list => list.access[schemaName].read)
              .map(list => list.listMeta(context)),
          ...objMerge(
            this._extendedQueries
              .filter(({ access }) => access[schemaName])
              .map(customResolver('query'))
          ),
        },

        Mutation: {
          ...objMerge(firstClassLists.map(list => list.gqlAuxMutationResolvers())),
          ...objMerge(firstClassLists.map(list => list.gqlMutationResolvers({ schemaName }))),
          ...objMerge(
            this._extendedMutations
              .filter(({ access }) => access[schemaName])
              .map(customResolver('mutation'))
          ),
        },
      },
      o => Object.entries(o).length > 0
    );

    if (debugGraphQLSchemas()) {
      console.log(resolvers);
    }

    return {
      typeDefs: typeDefs.map(
        typeDef =>
          gql`
            ${typeDef}
          `
      ),
      resolvers,
    };
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
    const middlewares = flattenDeep([
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
