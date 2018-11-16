const pluralize = require('pluralize');

const {
  resolveAllKeys,
  mapKeys,
  omit,
  unique,
  intersection,
  mergeWhereClause,
  objMerge,
  arrayToObject,
  flatten,
  createLazyDeferred,
} = require('@voussoir/utils');

const { parseListAccess, validateListAccessControl } = require('@voussoir/access-control');

const logger = require('@voussoir/logger');

const { Text, Checkbox, Float } = require('@voussoir/fields');

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

const opToType = {
  read: 'query',
  create: 'mutation',
  update: 'mutation',
  delete: 'mutation',
};

const mapNativeTypeToKeystonType = (type, listKey, fieldPath) => {
  if (!nativeTypeMap.has(type)) {
    return type;
  }

  const { name, keystoneType } = nativeTypeMap.get(type);

  keystoneLogger.warn(
    { nativeType: type, keystoneType, listKey, fieldPath },
    `Mapped field ${listKey}.${fieldPath} from native JavaScript type '${name}', to '${
      keystoneType.type.type
    }' from the @voussoir/fields package.`
  );

  return keystoneType;
};

module.exports = class List {
  constructor(key, config, { getListByKey, adapter, defaultAccess, getAuth }) {
    this.key = key;

    // 180814 JM TODO: Since there's no access control specified, this implicitly makes name, id or {labelField} readable by all (probably bad?)
    config.adminConfig = {
      defaultPageSize: 50,
      defaultColumns: Object.keys(config.fields)
        .slice(0, 2)
        .join(','),
      defaultSort: Object.keys(config.fields)[0],
      maximumPageSize: 1000,
      ...(config.adminConfig || {}),
    };
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

    this.adminUILabels = {
      label: config.label || plural,
      singular: config.singular || singular,
      plural: config.plural || plural,
      path: config.path || labelToPath(plural),
    };

    const itemQueryName = config.itemQueryName || labelToClass(singular);
    const listQueryName = config.listQueryName || labelToClass(plural);

    this.gqlNames = {
      outputTypeName: this.key,
      itemQueryName: itemQueryName,
      listQueryName: `all${listQueryName}`,
      listQueryMetaName: `_all${listQueryName}Meta`,
      listMetaName: `_${listQueryName}Meta`,
      authenticatedQueryName: `authenticated${itemQueryName}`,
      deleteMutationName: `delete${itemQueryName}`,
      deleteManyMutationName: `delete${listQueryName}`,
      updateMutationName: `update${itemQueryName}`,
      createMutationName: `create${itemQueryName}`,
      whereInputName: `${itemQueryName}WhereInput`,
      whereUniqueInputName: `${itemQueryName}WhereUniqueInput`,
      updateInputName: `${itemQueryName}UpdateInput`,
      createInputName: `${itemQueryName}CreateInput`,
      relateToManyInputName: `${itemQueryName}RelateToManyInput`,
      relateToOneInputName: `${itemQueryName}RelateToOneInput`,
    };

    this.adapter = adapter.newListAdapter(this.key, this.config);

    this.access = parseListAccess({
      listKey: key,
      access: config.access,
      defaultAccess: this.defaultAccess.list,
    });

    const sanitisedFieldsConfig = mapKeys(config.fields, (fieldConfig, path) => {
      return {
        ...fieldConfig,
        type: mapNativeTypeToKeystonType(fieldConfig.type, key, path),
      };
    });

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

    this.views = mapKeys(sanitisedFieldsConfig, fieldConfig => ({
      ...fieldConfig.type.views,
    }));
  }

  getAdminMeta() {
    return {
      key: this.key,
      // Reduce to truthy values (functions can't be passed over the webpack
      // boundary)
      access: mapKeys(this.access, val => !!val),
      label: this.adminUILabels.label,
      singular: this.adminUILabels.singular,
      plural: this.adminUILabels.plural,
      path: this.adminUILabels.path,
      gqlNames: this.gqlNames,
      fields: this.fields.filter(field => field.access.read).map(field => field.getAdminMeta()),
      views: this.views,
      adminConfig: {
        defaultPageSize: this.config.adminConfig.defaultPageSize,
        defaultColumns: this.config.adminConfig.defaultColumns.replace(/\s/g, ''), // remove all whitespace
        defaultSort: this.config.adminConfig.defaultSort,
        maximumPageSize: Math.max(
          this.config.adminConfig.defaultPageSize,
          this.config.adminConfig.maximumPageSize
        ),
      },
    };
  }
  get gqlTypes() {
    // https://github.com/opencrud/opencrud/blob/master/spec/2-relational/2-2-queries/2-2-3-filters.md#boolean-expressions
    const types = flatten(this.fields.map(field => field.gqlAuxTypes));

    if (this.access.read || this.access.create || this.access.update || this.access.delete) {
      types.push(
        `
        type ${this.gqlNames.outputTypeName} {
          id: ID
          """
          This virtual field will be resolved in one of the following ways (in this order):
           1. Execution of 'labelResolver' set on the ${this.key} List config, or
           2. As an alias to the field set on 'labelField' in the ${this.key} List config, or
           3. As an alias to a 'name' field on the ${this.key} List (if one exists), or
           4. As an alias to the 'id' field on the ${this.key} List.
          """
          _label_: String
          ${flatten(
            this.fields
              .filter(field => field.access.read) // If it's globally set to false, makes sense to never show it
              .map(field => field.gqlOutputFields)
          ).join('\n')}
        }
      `,
        `
        input ${this.gqlNames.whereInputName} {
          id: ID
          id_not: ID
          id_in: [ID!]
          id_not_in: [ID!]

          AND: [${this.gqlNames.whereInputName}]
          OR: [${this.gqlNames.whereInputName}]

          ${flatten(
            this.fields
              .filter(field => field.access.read) // If it's globally set to false, makes sense to never show it
              .map(field => field.gqlQueryInputFields)
          ).join('\n')}
        }`,
        // TODO: Include other `unique` fields and allow filtering by them
        `
        input ${this.gqlNames.whereUniqueInputName} {
          id: ID!
        }`
      );
    }

    if (this.access.update) {
      types.push(`
        input ${this.gqlNames.updateInputName} {
          ${flatten(
            this.fields
              .filter(field => field.access.update) // If it's globally set to false, makes sense to never let it be updated
              .map(field => field.gqlUpdateInputFields)
          ).join('\n')}
        }
      `);
    }

    if (this.access.create) {
      types.push(`
        input ${this.gqlNames.createInputName} {
          ${flatten(
            this.fields
              .filter(field => field.access.create) // If it's globally set to false, makes sense to never let it be created
              .map(field => field.gqlCreateInputFields)
          ).join('\n')}
        }
      `);
    }

    return types;
  }

  getGraphqlFilterFragment() {
    return [
      `where: ${this.gqlNames.whereInputName}`,
      `search: String`,
      `orderBy: String`,
      `first: Int`,
      `skip: Int`,
    ];
  }

  get gqlQueries() {
    // All the auxiliary queries the fields want to add
    const queries = flatten(this.fields.map(field => field.gqlAuxQueries));

    // If `read` is either `true`, or a function (we don't care what the result
    // of the function is, that'll get executed at a later time)
    if (this.access.read) {
      queries.push(
        `
        ${this.gqlNames.listQueryName}(
          ${this.getGraphqlFilterFragment().join('\n')}
        ): [${this.gqlNames.outputTypeName}]`,

        `${this.gqlNames.itemQueryName}(
          where: ${this.gqlNames.whereUniqueInputName}!
        ): ${this.gqlNames.outputTypeName}`,

        `${this.gqlNames.listQueryMetaName}(
          ${this.getGraphqlFilterFragment().join('\n')}
        ): _QueryMeta`,

        `${this.gqlNames.listMetaName}: _ListMeta`
      );
    }

    if (this.getAuth()) {
      // If auth is enabled for this list (doesn't matter what strategy)
      queries.push(`${this.gqlNames.authenticatedQueryName}: ${this.gqlNames.outputTypeName}`);
    }

    return queries;
  }

  async itemQuery({ id, context, name }) {
    const operation = 'read';
    graphqlLogger.debug({ id, operation, type: opToType[operation], name }, 'Start query');
    const result = await this.getAccessControlledItem({ id, context, operation, gqlName: name });
    graphqlLogger.debug({ id, operation, type: opToType[operation], name }, 'End query');
    return result;
  }

  listMeta(context) {
    return {
      name: this.key,
      // Return these as functions so they're lazily evaluated depending
      // on what the user requested
      // Evalutation takes place in ../Keystone/index.js
      // NOTE: These could return a Boolean or a JSON object (if using the
      // declarative syntax)
      getAccess: () => ({
        getCreate: () => context.getListAccessControlForUser(this.key, 'create'),
        getRead: () => context.getListAccessControlForUser(this.key, 'read'),
        getUpdate: () => context.getListAccessControlForUser(this.key, 'update'),
        getDelete: () => context.getListAccessControlForUser(this.key, 'delete'),
      }),
      getSchema: () => {
        const queries = [
          this.gqlNames.itemQueryName,
          this.gqlNames.listQueryName,
          this.gqlNames.listQueryMetaName,
        ];

        if (this.getAuth()) {
          queries.push(this.gqlNames.authenticatedQueryName);
        }

        // NOTE: Other fields on this type are resolved in the main resolver in
        // ../Keystone/index.js
        return {
          type: this.gqlNames.outputTypeName,
          queries,
          key: this.key,
        };
      },
    };
  }

  getFieldsRelatedTo(listKey) {
    return this.fields.filter(
      ({ isRelationship, refListKey }) => isRelationship && refListKey === listKey
    );
  }

  get gqlQueryResolvers() {
    let resolvers = {};

    // If set to false, we can confidently remove these resolvers entirely from
    // the graphql schema
    if (this.access.read) {
      resolvers = {
        [this.gqlNames.listQueryName]: (_, args, context) =>
          this.listQuery(args, context, this.gqlNames.listQueryName),

        [this.gqlNames.listQueryMetaName]: (_, args, context) =>
          this.listQueryMeta(args, context, this.gqlNames.listQueryMetaName),

        [this.gqlNames.listMetaName]: (_, args, context) => this.listMeta(context),

        [this.gqlNames.itemQueryName]: (_, { where: { id } }, context) =>
          this.itemQuery({ id, context, name: this.gqlNames.itemQueryName }),
      };
    }

    // NOTE: This query is not effected by the read permissions; if the user can
    // authenticate themselves, then they already have access to know that the
    // list exists
    if (this.getAuth()) {
      resolvers[this.gqlNames.authenticatedQueryName] = (_, __, context) =>
        this.authenticatedQuery(context);
    }

    return resolvers;
  }

  authenticatedQuery(context) {
    if (!context.authedItem || context.authedListKey !== this.key) {
      return null;
    }

    return this.itemQuery({
      id: context.authedItem.id,
      context,
      name: this.gqlNames.authenticatedQueryName,
    });
  }

  _throwAccessDenied(operation, context, target, extraInternalData = {}, extraData = {}) {
    throw new AccessDeniedError({
      data: {
        type: opToType[operation],
        target,
        ...extraData,
      },
      internalData: {
        authedId: context.authedItem && context.authedItem.id,
        authedListKey: context.authedListKey,
        ...extraInternalData,
      },
    });
  }

  checkListAccess(context, operation, gqlName, extraInternalData) {
    const access = context.getListAccessControlForUser(this.key, operation);
    if (!access) {
      graphqlLogger.debug(
        { operation, access, gqlName, ...extraInternalData },
        'Access statically or implicitly denied'
      );
      graphqlLogger.info({ operation, gqlName, ...extraInternalData }, 'Access Denied');
      // If the client handles errors correctly, it should be able to
      // receive partial data (for the fields the user has access to),
      // and then an `errors` array of AccessDeniedError's
      this._throwAccessDenied(operation, context, gqlName, extraInternalData);
    }
    return access;
  }

  // Wrap the "inner" resolver for a single output field with an access control check
  wrapFieldResolverWithAC(field, innerResolver) {
    return (item, args, context, ...rest) => {
      // If not allowed access
      const operation = 'read';
      const access = context.getFieldAccessControlForUser(this.key, field.path, item, operation);
      if (!access) {
        // If the client handles errors correctly, it should be able to
        // receive partial data (for the fields the user has access to),
        // and then an `errors` array of AccessDeniedError's
        this._throwAccessDenied(operation, context, field.path, { itemId: item ? item.id : null });
      }

      // Otherwise, execute the original/inner resolver
      return innerResolver(item, args, context, ...rest);
    };
  }

  // Get the resolvers for the (possibly multiple) output fields and wrap each with access control
  getWrappedFieldResolvers(field) {
    return mapKeys(field.gqlOutputFieldResolvers || {}, innerResolver =>
      this.wrapFieldResolverWithAC(field, innerResolver)
    );
  }

  get gqlFieldResolvers() {
    if (!this.access.read) {
      return {};
    }
    const fieldResolvers = {
      // TODO: The `_label_` output field currently circumvents access control
      _label_: this.config.labelResolver,
      ...objMerge(
        this.fields
          .filter(field => field.access.read)
          .map(field => this.getWrappedFieldResolvers(field))
      ),
    };
    return { [this.gqlNames.outputTypeName]: fieldResolvers };
  }

  get gqlAuxFieldResolvers() {
    // TODO: Obey the same ACL rules based on parent type
    return objMerge(this.fields.map(field => field.gqlAuxFieldResolvers));
  }
  get gqlAuxQueryResolvers() {
    // TODO: Obey the same ACL rules based on parent type
    return objMerge(this.fields.map(field => field.gqlAuxQueryResolvers));
  }
  get gqlAuxMutationResolvers() {
    // TODO: Obey the same ACL rules based on parent type
    return objMerge(this.fields.map(field => field.gqlAuxMutationResolvers));
  }

  get gqlMutations() {
    const mutations = flatten(this.fields.map(field => field.gqlAuxMutations));

    // NOTE: We only check for truthy as it could be `true`, or a function (the
    // function is executed later in the resolver)
    if (this.access.create) {
      mutations.push(`
        ${this.gqlNames.createMutationName}(
          data: ${this.gqlNames.createInputName}
        ): ${this.gqlNames.outputTypeName}
      `);
    }

    if (this.access.update) {
      mutations.push(`
        ${this.gqlNames.updateMutationName}(
          id: ID!
          data: ${this.gqlNames.updateInputName}
        ): ${this.gqlNames.outputTypeName}
      `);
    }

    if (this.access.delete) {
      mutations.push(`
        ${this.gqlNames.deleteMutationName}(
          id: ID!
        ): ${this.gqlNames.outputTypeName}
      `);

      mutations.push(`
        ${this.gqlNames.deleteManyMutationName}(
          ids: [ID!]
        ): [${this.gqlNames.outputTypeName}]
      `);
    }

    return mutations;
  }

  throwIfAccessDeniedOnFields({ operation, item, data, context, gqlName, extraData = {} }) {
    const restrictedFields = [];

    this.fields
      .filter(field => field.path in data)
      .forEach(field => {
        const access = context.getFieldAccessControlForUser(this.key, field.path, item, operation);
        if (!access) {
          restrictedFields.push(field.path);
        }
      });

    if (restrictedFields.length) {
      this._throwAccessDenied(operation, context, gqlName, extraData, { restrictedFields });
    }
  }

  async getAccessControlledItem({ operation, id, context, gqlName }) {
    const throwAccessDenied = (access, msg) => {
      graphqlLogger.debug({ id, operation, access, gqlName }, msg);
      graphqlLogger.info({ id, operation, gqlName }, 'Access Denied');
      // If the client handles errors correctly, it should be able to
      // receive partial data (for the fields the user has access to),
      // and then an `errors` array of AccessDeniedError's
      this._throwAccessDenied(operation, context, gqlName, { itemId: id });
    };

    const access = this.checkListAccess(context, operation, gqlName, { itemId: id });

    const throwNotFound = () => {
      // NOTE: There is a potential security risk here if we were to
      // further check the existence of an item with the given ID: It'd be
      // possible to figure out if records with particular IDs exist in
      // the DB even if the user doesn't have access (eg; check a bunch of
      // IDs, and the ones that return AccessDenied exist, and the ones
      // that return null do not exist). Similar to how S3 returns 403's
      // always instead of ever returning 404's.
      // Our version is to always throw if not found.
      throwAccessDenied(access, 'Zero items found');
    };

    let item;
    // Early out - the user has full access to update this list
    if (access === true) {
      item = await this.adapter.findById(id);
    } else {
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
        throwAccessDenied(access, 'Item excluded this id from filters');
      }

      // NOTE: The fields will be filtered by the ACL checking in
      // gqlFieldResolvers()
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
      item = (await this.adapter.itemsQuery(queryArgs))[0];
    }
    if (!item) {
      // Throwing an AccessDenied here if the item isn't found because we're
      // strict about accidentally leaking information (that the item doesn't
      // exist)
      throwNotFound();
    }
    // Found the item, and it passed the filter test
    return item;
  }

  async getAccessControlledItems({ operation, ids, context, gqlName }) {
    if (ids.length === 0) {
      return [];
    }

    const access = this.checkListAccess(context, operation, gqlName, { itemIds: ids });

    const uniqueIds = unique(ids);

    // Early out - the user has full access to operate on this list
    if (access === true) {
      return await this.adapter.itemsQuery({ where: { id_in: uniqueIds } });
    }

    let idFilters = {};

    if (access.id || access.id_in) {
      const accessControlIdsAllowed = unique([].concat(access.id, access.id_in).filter(id => id));

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
    // gqlFieldResolvers()
    let queryArgs = {
      where: {
        ...omit(access, ['id', 'id_not', 'id_in', 'id_not_in']),
        ...idFilters,
      },
    };
    // NOTE: Unlike in the single-operation variation, there is no security risk
    // in returning the result of the query here, because if no items match, we
    // return an empty array regarless of if that's because of lack of
    // permissions or because of those items don't exist.
    return await this.adapter.itemsQuery(queryArgs);
  }

  async createMutation(data, context) {
    const operation = 'create';
    const gqlName = this.gqlNames.createMutationName;

    this.checkListAccess(context, operation, gqlName);

    // Merge in default Values here
    const item = {
      ...arrayToObject(
        this.fields.filter(field => field.getDefaultValue() !== undefined),
        'path',
        field => field.getDefaultValue()
      ),
      ...data,
    };

    this.throwIfAccessDeniedOnFields({ operation, item, data, context, gqlName });

    // Enable pre-hooks to perform some action after the item is created by
    // giving them a promise which will eventually resolve with the value of the
    // newly created item.
    const createdPromise = createLazyDeferred();

    const resolvedData = await resolveAllKeys(
      mapKeys(data, (value, fieldPath) =>
        this.fieldsByPath[fieldPath].createFieldPreHook(value, context, createdPromise.promise)
      )
    );

    let newItem;
    try {
      newItem = await this.adapter.create(resolvedData);
      createdPromise.resolve(newItem);
      // Wait until next tick so the promise/micro-task queue can be flushed
      // fully, ensuring the deferred handlers get executed before we move on
      await new Promise(res => process.nextTick(res));
    } catch (error) {
      createdPromise.reject(error);
      // Wait until next tick so the promise/micro-task queue can be flushed
      // fully, ensuring the deferred handlers get executed before we move on
      await new Promise(res => process.nextTick(res));
      // Rethrow the error to ensure it's surfaced to Apollo
      throw error;
    }

    await Promise.all(
      Object.keys(data).map(fieldPath =>
        this.fieldsByPath[fieldPath].createFieldPostHook(newItem[fieldPath], newItem, context)
      )
    );

    return newItem;
  }

  async updateMutation(id, data, context) {
    const operation = 'update';
    const gqlName = this.gqlNames.updateMutationName;

    const item = await this.getAccessControlledItem({ id, context, operation, gqlName });
    const extraData = { itemId: id };
    this.throwIfAccessDeniedOnFields({ operation, item, data, context, gqlName, extraData });

    const resolvedData = await resolveAllKeys(
      mapKeys(data, (value, fieldPath) =>
        this.fieldsByPath[fieldPath].updateFieldPreHook(value, item, context)
      )
    );

    const newItem = await this.adapter.update(id, resolvedData);

    await Promise.all(
      Object.keys(data).map(fieldPath =>
        this.fieldsByPath[fieldPath].updateFieldPostHook(newItem[fieldPath], newItem, context)
      )
    );

    return newItem;
  }

  async _tryManyQuery(args, context, gqlName, manyQuery) {
    const access = this.checkListAccess(context, 'read', gqlName);
    let queryArgs = mergeWhereClause(args, access);

    return manyQuery(queryArgs);
  }

  async listQuery(args, context, queryName) {
    return this._tryManyQuery(args, context, queryName, queryArgs =>
      this.adapter.itemsQuery(queryArgs)
    );
  }

  async listQueryMeta(args, context, queryName) {
    return {
      // Return these as functions so they're lazily evaluated depending
      // on what the user requested
      // Evalutation takes place in ../Keystone/index.js
      getCount: () => {
        return this._tryManyQuery(args, context, queryName, queryArgs =>
          this.adapter.itemsQueryMeta(queryArgs).then(({ count }) => count)
        );
      },
    };
  }

  async _deleteWithFieldHooks(item, context) {
    await Promise.all(
      this.fields.map(field => field.deleteFieldPreHook(item[field.path], item, context))
    );

    const result = await this.adapter.delete(item.id);

    await Promise.all(
      this.fields.map(field => field.deleteFieldPostHook(item[field.path], item, context))
    );

    return result;
  }

  async deleteMutation(id, context) {
    const operation = 'delete';
    const gqlName = this.gqlNames.deleteManyMutationName;

    const item = await this.getAccessControlledItem({ id, context, operation, gqlName });
    return this._deleteWithFieldHooks(item, context);
  }

  async deleteManyMutation(ids, context) {
    const operation = 'delete';
    const gqlName = this.gqlNames.deleteManyMutationName;

    const items = await this.getAccessControlledItems({ ids, context, operation, gqlName });
    return Promise.all(items.map(async item => this._deleteWithFieldHooks(item, context)));
  }

  get gqlMutationResolvers() {
    const mutationResolvers = {};

    if (this.access.create) {
      mutationResolvers[this.gqlNames.createMutationName] = (_, { data }, context) =>
        this.createMutation(data, context);
    }

    if (this.access.update) {
      mutationResolvers[this.gqlNames.updateMutationName] = async (_, { id, data }, context) =>
        this.updateMutation(id, data, context);
    }

    if (this.access.delete) {
      mutationResolvers[this.gqlNames.deleteMutationName] = async (_, { id }, context) =>
        this.deleteMutation(id, context);

      mutationResolvers[this.gqlNames.deleteManyMutationName] = async (_, { ids }, context) =>
        this.deleteManyMutation(ids, context);
    }

    return mutationResolvers;
  }

  getAccessControl({ operation, authentication }) {
    return validateListAccessControl({
      access: this.access,
      operation,
      authentication,
      listKey: this.key,
    });
  }

  getFieldAccessControl({ fieldKey, item, inputData, operation, authentication }) {
    return this.fieldsByPath[fieldKey].validateAccessControl({
      listKey: this.key,
      item,
      inputData,
      operation,
      authentication,
    });
  }

  getFieldByPath(path) {
    return this.fieldsByPath[path];
  }
};
