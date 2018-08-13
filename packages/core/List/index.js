const pluralize = require('pluralize');
const {
  resolveAllKeys,
  mapKeys,
  omit,
  unique,
  intersection,
} = require('@keystonejs/utils');

const {
  parseListAccess,
  testListAccessControl,
  mergeWhereClause,
} = require('@keystonejs/access-control');

const logger = require('@keystonejs/logger');

const { Text, Checkbox, Float } = require('@keystonejs/fields');

const graphqlLogger = logger('graphql');
const keystoneLogger = logger('keystone');

const { AccessDeniedError } = require('./graphqlErrors');

const upcase = str => str.substr(0, 1).toUpperCase() + str.substr(1);

const keyToLabel = str =>
  str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/\s|_|\-/)
    .filter(i => i)
    .map(upcase)
    .join(' ');

const labelToPath = str =>
  str
    .split(' ')
    .join('-')
    .toLowerCase();

const labelToClass = str => str.replace(/\s+/g, '');

const nativeTypeMap = new Map([
  [
    Boolean,
    {
      name: 'Boolean',
      keystoneType: Checkbox,
    },
  ],
  [
    String,
    {
      name: 'String',
      keystoneType: Text,
    },
  ],
  [
    Number,
    {
      name: 'Number',
      keystoneType: Float,
    },
  ],
]);

const mapNativeTypeToKeystonType = (type, listKey, fieldPath) => {
  if (!nativeTypeMap.has(type)) {
    return type;
  }

  const { name, keystoneType } = nativeTypeMap.get(type);

  keystoneLogger.warn(
    { nativeType: type, keystoneType, listKey, fieldPath },
    `Mapped field ${listKey}.${fieldPath} from native JavaScript type '${name}', to '${
      keystoneType.type.type
    }' from the @keystonejs/fields package.`
  );

  return keystoneType;
};

module.exports = class List {
  constructor(key, config, { getListByKey, adapter, defaultAccess, getAuth }) {
    this.key = key;

    this.config = {
      labelResolver: item => item[config.labelField || 'name'] || item.id,
      ...config,
    };
    this.getListByKey = getListByKey;
    this.defaultAccess = defaultAccess;
    this.getAuth = getAuth;

    const label = keyToLabel(key);
    const singular = pluralize.singular(label);
    const plural = pluralize.plural(label);

    if (plural === label) {
      throw new Error(
        `Unable to use ${label} as a List name - it has an ambiguous plural (${plural}). Please choose another name for your list.`
      );
    }

    this.label = config.label || plural;
    this.singular = config.singular || singular;
    this.plural = config.plural || plural;
    this.path = config.path || labelToPath(plural);

    const itemQueryName = config.itemQueryName || labelToClass(singular);
    const listQueryName = config.listQueryName || labelToClass(plural);

    this.itemQueryName = itemQueryName;
    this.listQueryName = `all${listQueryName}`;
    this.listQueryMetaName = `_${this.listQueryName}Meta`;
    this.listMetaName = `_${listQueryName}Meta`;
    this.authenticatedQueryName = `authenticated${itemQueryName}`;
    this.deleteMutationName = `delete${itemQueryName}`;
    this.deleteManyMutationName = `delete${listQueryName}`;
    this.updateMutationName = `update${itemQueryName}`;
    this.createMutationName = `create${itemQueryName}`;

    this.adapter = adapter.newListAdapter(this.key, this.config);

    this.access = parseListAccess({
      listKey: key,
      access: config.access,
      defaultAccess: this.defaultAccess.list,
    });

    const sanitisedFieldsConfig = mapKeys(
      config.fields,
      (fieldConfig, path) => {
        return {
          ...fieldConfig,
          type: mapNativeTypeToKeystonType(fieldConfig.type, key, path),
        };
      }
    );

    this.fieldsByPath = {};
    this.fields = config.fields
      ? Object.keys(sanitisedFieldsConfig).map(path => {
          const { type, ...fieldSpec } = sanitisedFieldsConfig[path];
          const implementation = type.implementation;
          this.fieldsByPath[path] = new implementation(path, fieldSpec, {
            getListByKey,
            listKey: key,
            listAdapter: this.adapter,
            fieldAdapterClass: type.adapters[adapter.name],
            defaultAccess: this.defaultAccess.field,
          });
          return this.fieldsByPath[path];
        })
      : [];

    this.adapter.prepareModel();

    this.views = {};
    Object.entries(sanitisedFieldsConfig).forEach(([path, fieldConfig]) => {
      const fieldType = fieldConfig.type;
      this.views[path] = {};

      Object.entries(fieldType.views).forEach(
        ([fieldViewType, fieldViewPath]) => {
          this.views[path][fieldViewType] = fieldViewPath;
        }
      );
    });
  }
  getAdminMeta() {
    return {
      key: this.key,
      // Reduce to truthy values (functions can't be passed over the webpack
      // boundary)
      access: mapKeys(this.access, val => !!val),
      label: this.label,
      singular: this.singular,
      plural: this.plural,
      path: this.path,
      listQueryName: this.listQueryName,
      listQueryMetaName: this.listQueryMetaName,
      listMetaName: this.listMetaName,
      itemQueryName: this.itemQueryName,
      createMutationName: this.createMutationName,
      updateMutationName: this.updateMutationName,
      deleteMutationName: this.deleteMutationName,
      deleteManyMutationName: this.deleteManyMutationName,
      fields: this.fields
        .filter(field => field.access.read)
        .map(field => field.getAdminMeta()),
      views: this.views,
    };
  }
  getAdminGraphqlTypes() {
    const fieldSchemas = this.fields
      // If it's globally set to false, makes sense to never show it
      .filter(field => field.access.read)
      .map(field => field.getGraphqlSchema())
      .join('\n          ');

    const fieldTypes = this.fields
      .map(i => i.getGraphqlAuxiliaryTypes())
      .filter(i => i);

    const updateArgs = this.fields
      // If it's globally set to false, makes sense to never let it be updated
      .filter(field => field.access.update)
      .map(field => field.getGraphqlUpdateArgs())
      .filter(i => i)
      .map(i => i.split(/\n\s+/g).join('\n          '))
      .join('\n          ')
      .trim();

    const createArgs = this.fields
      // If it's globally set to false, makes sense to never let it be created
      .filter(field => field.access.create)
      .map(i => i.getGraphqlCreateArgs())
      .filter(i => i)
      .map(i => i.split(/\n\s+/g).join('\n          '))
      .join('\n          ')
      .trim();

    const queryArgs = this.fields
      // If it's globally set to false, makes sense to never show it
      .filter(field => field.access.read)
      .map(field => {
        const fieldQueryArgs = field
          .getGraphqlQueryArgs()
          .split(/\n\s+/g)
          .join('\n          ');

        if (!fieldQueryArgs) {
          return null;
        }

        return `# ${field.constructor.name} field\n          ${fieldQueryArgs}`;
      })
      .filter(i => i)
      .join('\n\n          ');

    const types = [
      // TODO: AND / OR filters:
      // https://github.com/opencrud/opencrud/blob/master/spec/2-relational/2-2-queries/2-2-3-filters.md#boolean-expressions
      ...fieldTypes,
    ];

    if (
      this.access.read ||
      this.access.create ||
      this.access.update ||
      this.access.delete
    ) {
      // prettier-ignore
      types.push(`
        type ${this.key} {
          id: String
          # This virtual field will be resolved in one of the following ways (in this order):
          # 1. Execution of 'labelResolver' set on the ${this.key} List config, or
          # 2. As an alias to the field set on 'labelField' in the ${this.key} List config, or
          # 3. As an alias to a 'name' field on the ${this.key} List (if one exists), or
          # 4. As an alias to the 'id' field on the ${this.key} List.
          _label_: String
          ${fieldSchemas}
        }
      `);
    }

    if (this.access.read) {
      types.push(`
        input ${this.itemQueryName}WhereInput {
          id: ID
          id_not: ID
          id_in: [ID!]
          id_not_in: [ID!]
          ${queryArgs}
        }
      `);
      types.push(`
        input ${this.itemQueryName}WhereUniqueInput {
          id: ID!
        }
      `);
    }

    if (this.access.update) {
      types.push(`
        input ${this.key}UpdateInput {
          ${updateArgs}
        }
      `);
    }

    if (this.access.create) {
      types.push(`
        input ${this.key}CreateInput {
          ${createArgs}
        }
      `);
    }

    return types;
  }

  getAdminGraphqlQueries() {
    const commonArgs = `
    search: String
    orderBy: String
    sort: String
    
    # Pagination
    first: Int
    skip: Int`;

    // All the auxiliary queries the fields want to add
    const queries = this.fields
      .map(field => field.getGraphqlAuxiliaryQueries())
      // Filter out any empty elements
      .filter(query => query);

    // If `read` is either `true`, or a function (we don't care what the result
    // of the function is, that'll get executed at a later time)
    if (this.access.read) {
      // prettier-ignore
      queries.push(`
        ${this.listQueryName}(
          where: ${this.itemQueryName}WhereInput

          ${commonArgs.trim()}
        ): [${this.key}]

        ${this.itemQueryName}(where: ${this.itemQueryName}WhereUniqueInput!): ${this.key}

        ${this.listQueryMetaName}(
          where: ${this.itemQueryName}WhereInput

          ${commonArgs.trim()}
        ): _QueryMeta

        ${this.listMetaName}: _ListMeta
      `);
    }

    if (this.getAuth()) {
      // If auth is enabled for this list (doesn't matter what strategy)
      queries.push(`${this.authenticatedQueryName}: ${this.key}`);
    }

    return queries;
  }

  async singleItemResolver({ id, context, name }) {
    graphqlLogger.debug(
      {
        id,
        operation: 'read',
        type: 'query',
        name,
      },
      'Start query'
    );
    const result = await this.performActionOnItemWithAccessControl(
      {
        id,
        context,
        operation: 'read',
        errorData: {
          type: 'query',
          name,
        },
      },
      item => item
    );
    graphqlLogger.debug(
      {
        id,
        operation: 'read',
        type: 'query',
        name,
      },
      'End query'
    );
    return result;
  }

  getAdminQueryResolvers() {
    let resolvers = {};

    // If set to false, we can confidently remove these resolvers entirely from
    // the graphql schema
    if (this.access.read) {
      resolvers = {
        [this.listQueryName]: (_, args, context) => {
          const access = context.getListAccessControlForUser(this.key, 'read');
          if (!access) {
            // If the client handles errors correctly, it should be able to
            // receive partial data (for the fields the user has access to),
            // and then an `errors` array of AccessDeniedError's
            throw new AccessDeniedError({
              data: {
                type: 'query',
                name: this.listQueryName,
              },
              internalData: {
                authedId: context.authedItem && context.authedItem.id,
                authedListKey: context.authedListKey,
              },
            });
          }

          let queryArgs = mergeWhereClause(args, access);
          return this.adapter.itemsQuery(queryArgs);
        },

        [this.listQueryMetaName]: (_, args, context) => {
          return {
            // Return these as functions so they're lazily evaluated depending
            // on what the user requested
            // Evalutation takes place in ../Keystone/index.js
            getCount: () => {
              const access = context.getListAccessControlForUser(
                this.key,
                'read'
              );
              if (!access) {
                // If the client handles errors correctly, it should be able to
                // receive partial data (for the fields the user has access to),
                // and then an `errors` array of AccessDeniedError's
                throw new AccessDeniedError({
                  data: {
                    type: 'query',
                    name: this.listQueryMetaName,
                  },
                  internalData: {
                    authedId: context.authedItem && context.authedItem.id,
                    authedListKey: context.authedListKey,
                  },
                });
              }
              let queryArgs = mergeWhereClause(args, access);
              return this.adapter
                .itemsQueryMeta(queryArgs)
                .then(({ count }) => count);
            },
          };
        },

        [this.listMetaName]: () => {
          return {
            // Return these as functions so they're lazily evaluated depending
            // on what the user requested
            // Evalutation takes place in ../Keystone/index.js
            // NOTE: These could return a Boolean or a JSON object (if using the
            // declarative syntax)
            getAccess: () => ({
              getCreate: () =>
                context.getListAccessControlForUser(this.key, 'create'),
              getRead: () =>
                context.getListAccessControlForUser(this.key, 'read'),
              getUpdate: () =>
                context.getListAccessControlForUser(this.key, 'update'),
              getDelete: () =>
                context.getListAccessControlForUser(this.key, 'delete'),
            }),
          };
        },

        [this.itemQueryName]: (_, { where: { id } }, context) =>
          this.singleItemResolver({ id, context, name: this.itemQueryName }),
      };
    }

    // NOTE: This query is not effected by the read permissions; if the user can
    // authenticate themselves, then they already have access to know that the
    // list exists
    if (this.getAuth()) {
      resolvers[this.authenticatedQueryName] = (_, __, context) => {
        if (!context.authedItem || context.authedListKey !== this.key) {
          return null;
        }

        return this.singleItemResolver({
          id: context.authedItem.id,
          context,
          name: this.authenticatedQueryName,
        });
      };
    }

    return resolvers;
  }

  wrapFieldQueryResolversWithACL(originalResolvers) {
    return this.fields.reduce(
      (resolvers, field) => {
        const originalResolver = originalResolvers[field.path];

        // The field isn't readable at all, so don't include it
        if (!field.access.read) {
          return resolvers;
        }

        return {
          ...resolvers,
          // Ensure there's a field resolver for every field
          [field.path]: (item, args, context, ...rest) => {
            // If not allowed access
            const access = context.getFieldAccessControlForUser(
              this.key,
              field.path,
              item,
              'read'
            );
            if (!access) {
              // If the client handles errors correctly, it should be able to
              // receive partial data (for the fields the user has access to),
              // and then an `errors` array of AccessDeniedError's
              throw new AccessDeniedError({
                data: {
                  type: 'query',
                },
                internalData: {
                  authedId: context.authedItem && context.authedItem.id,
                  authedListKey: context.authedListKey,
                  itemId: item ? item.id : null,
                },
              });
            }

            // Otherwise, execute the original resolver (if there is one)
            return originalResolver
              ? originalResolver(item, args, context, ...rest)
              : item[field.path];
          },
        };
      },
      { ...originalResolvers }
    );
  }

  getAdminFieldResolvers() {
    if (!this.access.read) {
      return {};
    }

    const fieldResolvers = this.fields
      .filter(field => field.access.read)
      .reduce(
        (resolvers, field) => ({
          ...resolvers,
          ...field.getGraphqlFieldResolvers(),
        }),
        {
          _label_: this.config.labelResolver,
        }
      );
    return { [this.key]: this.wrapFieldQueryResolversWithACL(fieldResolvers) };
  }
  getAuxiliaryTypeResolvers() {
    return this.fields.reduce(
      (resolvers, field) => ({
        ...resolvers,
        // TODO: Obey the same ACL rules based on parent type
        ...field.getGraphqlAuxiliaryTypeResolvers(),
      }),
      {}
    );
  }
  getAuxiliaryQueryResolvers() {
    // TODO: Obey the same ACL rules based on parent type
    return this.fields.reduce(
      (resolvers, field) => ({
        ...resolvers,
        ...field.getGraphqlAuxiliaryQueryResolvers(),
      }),
      {}
    );
  }
  getAuxiliaryMutationResolvers() {
    // TODO: Obey the same ACL rules based on parent type
    return this.fields.reduce(
      (resolvers, field) => ({
        ...resolvers,
        ...field.getGraphqlAuxiliaryMutationResolvers(),
      }),
      {}
    );
  }

  getAdminGraphqlMutations() {
    const mutations = this.fields.map(field =>
      field.getGraphqlAuxiliaryMutations()
    );

    // NOTE: We only check for truthy as it could be `true`, or a function (the
    // function is executed later in the resolver)
    if (this.access.create) {
      mutations.push(`
        ${this.createMutationName}(
          data: ${this.key}CreateInput
        ): ${this.key}
      `);
    }

    if (this.access.update) {
      mutations.push(`
        ${this.updateMutationName}(
          id: String!
          data: ${this.key}UpdateInput
        ): ${this.key}
      `);
    }

    if (this.access.delete) {
      mutations.push(`
        ${this.deleteMutationName}(
          id: String!
        ): ${this.key}
      `);

      mutations.push(`
        ${this.deleteManyMutationName}(
          ids: [String!]
        ): [${this.key}]
      `);
    }

    return mutations.filter(mutation => mutation);
  }

  throwIfAccessDeniedOnFields({
    accessType,
    item,
    inputData,
    context,
    errorMeta = {},
    errorMetaForLogging = {},
  }) {
    const restrictedFields = [];

    this.fields.filter(field => field.path in inputData).forEach(field => {
      const access = context.getFieldAccessControlForUser(
        this.key,
        field.path,
        item,
        accessType
      );
      if (!access) {
        restrictedFields.push(field.path);
      }
    });

    if (restrictedFields.length) {
      throw new AccessDeniedError({
        data: {
          restrictedFields,
          ...errorMeta,
        },
        internalData: {
          authedId: context.authedItem && context.authedItem.id,
          authedListKey: context.authedListKey,
          ...errorMetaForLogging,
        },
      });
    }
  }

  async performActionOnItemWithAccessControl(
    { operation, id, context, errorData },
    action
  ) {
    const throwAccessDenied = () => {
      graphqlLogger.info(
        {
          id,
          operation,
          ...errorData,
        },
        'Access Denied'
      );
      // If the client handles errors correctly, it should be able to
      // receive partial data (for the fields the user has access to),
      // and then an `errors` array of AccessDeniedError's
      throw new AccessDeniedError({
        data: errorData,
        internalData: {
          authedId: context.authedItem && context.authedItem.id,
          authedListKey: context.authedListKey,
          itemId: id,
        },
      });
    };

    const access = context.getListAccessControlForUser(this.key, operation);
    if (!access) {
      graphqlLogger.debug(
        {
          id,
          operation,
          access,
          ...errorData,
        },
        'Access statically or implicitly denied'
      );
      throwAccessDenied();
    }

    // Early out - the user has full access to update this list
    if (access === true) {
      const item = await this.adapter.findById(id);
      return action(item);
    }

    // It's odd, but conceivable the access control specifies a single id
    // the user has access to. So we have to do a check here to see if the
    // ID they're requesting matches that ID.
    // Nice side-effect: We can throw without having to ever query the DB.
    // NOTE: Don't try to early out here by doing
    // if(access.id === id) return findById(id)
    // this will result in a possible false match if a declarative access
    // control clause has other items in it
    if (
      (access.id && access.id !== id) ||
      (access.id_not && access.id_not === id) ||
      (access.id_in && !access.id_in.includes(id)) ||
      (access.id_not_in && access.id_not_in.includes(id))
    ) {
      graphqlLogger.debug(
        {
          id,
          operation,
          access,
          ...errorData,
        },
        'Item excluded this id from filters'
      );
      throwAccessDenied();
    }

    // NOTE: The fields will be filtered by the ACL checking in
    // getAdminFieldResolvers()
    let queryArgs = {
      // We only want 1 item, don't make the DB do extra work
      first: 1,
      where: {
        // NOTE: Order here doesn't matter, if `access.id !== id`, it will
        // have been caught earlier, so this spread and overwrite can only
        // ever be additive or overwrite with the same value
        ...access,
        id,
      },
    };

    const items = await this.adapter.itemsQuery(queryArgs);

    if (items.length === 0) {
      // NOTE: There is a potential security risk here if we were to
      // further check the existence of an item with the given ID: It'd be
      // possible to figure out if records with particular IDs exist in
      // the DB even if the user doesn't have access (eg; check a bunch of
      // IDs, and the ones that return AccessDenied exist, and the ones
      // that return null do not exist). Similar to how S3 returns 403's
      // always instead of ever returning 404's.
      // Our version is to always throw if not found.
      graphqlLogger.debug(
        {
          id,
          operation,
          access,
          ...errorData,
        },
        'Zero items found'
      );
      throwAccessDenied();
    }

    // Found the item, and it passed the filter test
    return action(items[0]);
  }

  async performMultiActionOnItemsWithAccessControl(
    { operation, ids, context, errorData },
    action
  ) {
    if (ids.length === 0) {
      return [];
    }

    const access = context.getListAccessControlForUser(this.key, operation);
    if (!access) {
      // If the client handles errors correctly, it should be able to
      // receive partial data (for the fields the user has access to),
      // and then an `errors` array of AccessDeniedError's
      throw new AccessDeniedError({
        data: errorData,
        internalData: {
          authedId: context.authedItem && context.authedItem.id,
          authedListKey: context.authedListKey,
          itemIds: ids,
        },
      });
    }

    const uniqueIds = unique(ids);

    // Early out - the user has full access to operate on this list
    if (access === true) {
      const items = await this.adapter.itemsQuery({
        where: { id_in: uniqueIds },
      });
      return action(items);
    }

    let idFilters = {};

    if (access.id || access.id_in) {
      const accessControlIdsAllowed = unique(
        [].concat(access.id, access.id_in).filter(id => id)
      );

      idFilters.id_in = intersection(accessControlIdsAllowed, uniqueIds);
    } else {
      idFilters.id_in = uniqueIds;
    }

    if (access.id_not || access.id_not_in) {
      const accessControlIdsDisallowed = unique(
        [].concat(access.id_not, access.id_not_in).filter(id => id)
      );

      idFilters.id_not_in = intersection(accessControlIdsDisallowed, uniqueIds);
    }

    // It's odd, but conceivable the access control specifies a single id
    // the user has access to. So we have to do a check here to see if the
    // ID they're requesting matches that ID.
    // Nice side-effect: We can throw without having to ever query the DB.
    // NOTE: Don't try to early out here by doing
    // if(access.id === id) return findById(id)
    // this will result in a possible false match if the access control
    // has other items in it
    if (
      // Only some ids are allowed, and none of them have been passed in
      (idFilters.id_in && idFilters.id_in.length === 0) ||
      // All the passed in ids have been explicitly disallowed
      (idFilters.id_not_in && idFilters.id_not_in.length === uniqueIds.length)
    ) {
      // NOTE: We don't throw an error for multi-actions, only return an empty
      // array because there's no mechanism in GraphQL to return more than one
      // error for a list result.
      return [];
    }

    // NOTE: The fields will be filtered by the ACL checking in
    // getAdminFieldResolvers()
    let queryArgs = {
      where: {
        ...omit(access, ['id', 'id_not', 'id_in', 'id_not_in']),
        ...idFilters,
      },
    };

    const items = await this.adapter.itemsQuery(queryArgs);

    // NOTE: Unlike in the single-operation variation, there is no security risk
    // in returning the result of the query here, because if no items match, we
    // return an empty array regarless of if that's because of lack of
    // permissions or because of those items don't exist.
    return action(items);
  }

  async createMutation(data, context) {
    const access = context.getListAccessControlForUser(this.key, 'create');
    if (!access) {
      throw new AccessDeniedError({
        data: {
          type: 'mutation',
          name: this.createMutationName,
        },
        internalData: {
          authedId: context.authedItem && context.authedItem.id,
          authedListKey: context.authedListKey,
        },
      });
    }

    // Merge in default Values here
    const item = this.fields.reduce((memo, field) => {
      const defaultValue = field.getDefaultValue();

      // explicit `undefined` check as `null` is a valid value
      if (defaultValue === undefined) {
        return memo;
      }

      return {
        [field.path]: defaultValue,
        ...memo,
      };
    }, data);

    this.throwIfAccessDeniedOnFields({
      accessType: 'create',
      item,
      inputData: data,
      context,
      errorMeta: {
        type: 'mutation',
        name: this.updateMutationName,
      },
    });

    const resolvedData = await resolveAllKeys(
      Object.keys(data).reduce(
        (resolvers, fieldPath) => ({
          ...resolvers,
          [fieldPath]: this.fieldsByPath[fieldPath].createFieldPreHook(
            data[fieldPath],
            fieldPath,
            context
          ),
        }),
        {}
      )
    );

    const newItem = await this.adapter.create(resolvedData);

    await Promise.all(
      Object.keys(data).map(fieldPath =>
        this.fieldsByPath[fieldPath].createFieldPostHook(
          newItem[fieldPath],
          fieldPath,
          newItem,
          context
        )
      )
    );

    return newItem;
  }

  getAdminMutationResolvers() {
    const mutationResolvers = {};

    if (this.access.create) {
      mutationResolvers[this.createMutationName] = (_, { data }, context) =>
        this.createMutation(data, context);
    }

    if (this.access.update) {
      mutationResolvers[this.updateMutationName] = async (
        _,
        { id, data },
        context
      ) => {
        return this.performActionOnItemWithAccessControl(
          {
            id,
            context,
            operation: 'update',
            errorData: {
              type: 'mutation',
              name: this.updateMutationName,
            },
          },
          async item => {
            this.throwIfAccessDeniedOnFields({
              accessType: 'update',
              item,
              inputData: data,
              context,
              errorMeta: {
                type: 'mutation',
                name: this.updateMutationName,
              },
              errorMetaForLogging: {
                itemId: id,
              },
            });

            const resolvedData = await resolveAllKeys(
              Object.keys(data).reduce(
                (resolvers, fieldPath) => ({
                  ...resolvers,
                  [fieldPath]: this.fieldsByPath[fieldPath].updateFieldPreHook(
                    data[fieldPath],
                    fieldPath,
                    item,
                    context
                  ),
                }),
                {}
              )
            );

            const newItem = await this.adapter.update(
              id,
              // avoid any kind of injection attack by explicitly doing a `$set`
              // operation
              { $set: resolvedData },
              // Return the modified item, not the original
              { new: true }
            );

            await Promise.all(
              Object.keys(data).map(fieldPath =>
                this.fieldsByPath[fieldPath].updateFieldPostHook(
                  newItem[fieldPath],
                  fieldPath,
                  newItem,
                  context
                )
              )
            );

            return newItem;
          }
        );
      };
    }

    if (this.access.delete) {
      mutationResolvers[this.deleteMutationName] = async (
        _,
        { id },
        context
      ) => {
        return this.performActionOnItemWithAccessControl(
          {
            id,
            context,
            operation: 'delete',
            errorData: {
              type: 'mutation',
              name: this.deleteMutationName,
            },
          },
          (/* item */) => {
            // TODO: pre/post delete hooks
            return this.adapter.delete(id);
          }
        );
      };

      mutationResolvers[this.deleteManyMutationName] = async (
        _,
        { ids },
        context
      ) => {
        return this.performMultiActionOnItemsWithAccessControl(
          {
            ids,
            context,
            operation: 'delete',
            errorData: {
              type: 'mutation',
              name: this.deleteManyMutationName,
            },
          },
          items =>
            Promise.all(
              items.map(item => this.adapter.delete(item.id).then(() => item))
            )
        );
      };
    }

    return mutationResolvers;
  }

  getAccessControl({ operation, authentication }) {
    return testListAccessControl({
      access: this.access,
      operation,
      authentication,
      listKey: this.key,
    });
  }

  getFieldAccessControl({
    fieldKey,
    item,
    inputData,
    operation,
    authentication,
  }) {
    return this.fieldsByPath[fieldKey].testAccessControl({
      listKey: this.key,
      item,
      inputData,
      operation,
      authentication,
    });
  }
};
