const pluralize = require('pluralize');
const {
  parseACL,
  checkAccess,
  resolveAllKeys,
  pick,
} = require('@keystonejs/utils');

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

const mapKeys = (obj, func) =>
  Object.entries(obj).reduce(
    (memo, [key, value]) => ({ ...memo, [key]: func(value, key, obj) }),
    {}
  );

module.exports = class List {
  constructor(key, config, { getListByKey, adapter, keystone }) {
    this.key = key;

    this.config = {
      labelResolver: item => item[config.labelField || 'name'] || item.id,
      ...config,
    };
    this.getListByKey = getListByKey;
    this.keystone = keystone;

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

    const accessTypes = ['create', 'read', 'update', 'delete'];

    // Starting with the default, extend it with any config passed in
    this.acl = {
      ...pick(keystone.defaultAccess, accessTypes),
      ...parseACL(config.access, {
        accessTypes,
        listKey: key,
      }),
    };

    this.fieldsByPath = {};
    this.fields = config.fields
      ? Object.keys(config.fields).map(path => {
          const { type, ...fieldSpec } = config.fields[path];
          const implementation = type.implementation;
          this.fieldsByPath[path] = new implementation(path, fieldSpec, {
            getListByKey,
            listKey: key,
            listAdapter: this.adapter,
            fieldAdapterClass: type.adapters[adapter.name],
            defaultAccess: this.acl,
          });
          return this.fieldsByPath[path];
        })
      : [];

    this.adapter.prepareModel();

    this.views = {};
    Object.entries(config.fields).forEach(([path, fieldConfig]) => {
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
      acl: mapKeys(this.acl, val => !!val),
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
      fields: this.fields.map(i => i.getAdminMeta()),
      views: this.views,
    };
  }
  getAdminGraphqlTypes() {
    const fieldSchemas = this.fields
      // If it's globally set to false, makes sense to never show it
      .filter(field => !!field.acl.read)
      .map(field => field.getGraphqlSchema())
      .join('\n          ');

    const fieldTypes = this.fields
      .map(i => i.getGraphqlAuxiliaryTypes())
      .filter(i => i);

    const updateArgs = this.fields
      // If it's globally set to false, makes sense to never let it be updated
      .filter(field => !!field.acl.update)
      .map(field => field.getGraphqlUpdateArgs())
      .filter(i => i)
      .map(i => i.split(/\n\s+/g).join('\n          '))
      .join('\n          ')
      .trim();

    const createArgs = this.fields
      .map(i => i.getGraphqlCreateArgs())
      .filter(i => i)
      .map(i => i.split(/\n\s+/g).join('\n          '))
      .join('\n          ')
      .trim();

    const queryArgs = this.fields
      // If it's globally set to false, makes sense to never show it
      .filter(field => !!field.acl.read)
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
      .filter(Boolean)
      .join('\n\n          ');

    const types = [
      // TODO: AND / OR filters:
      // https://github.com/opencrud/opencrud/blob/master/spec/2-relational/2-2-queries/2-2-3-filters.md#boolean-expressions
      ...fieldTypes,
    ];

    if (
      this.acl.read ||
      this.acl.create ||
      this.acl.update ||
      this.acl.delete
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

    if (this.acl.read) {
      types.push(`
        input ${this.itemQueryName}WhereInput {
          id: ID
          id_not: ID
          ${queryArgs}
        }
      `);
      types.push(`
        input ${this.itemQueryName}WhereUniqueInput {
          id: ID!
        }
      `);
    }

    if (this.acl.update) {
      types.push(`
        input ${this.key}UpdateInput {
          ${updateArgs}
        }
      `);
    }

    if (this.acl.create) {
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

          # Pagination
          first: Int
          skip: Int`;

    // All the auxiliary queries the fields want to add
    const queries = this.fields
      .map(field => field.getGraphqlAuxiliaryQueries())
      // Filter out any empty elements
      .filter(Boolean);

    // If `read` is either `true`, or a function (we don't care what the result
    // of the function is, that'll get executed at a later time)
    if (this.acl.read) {
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

    if (this.keystone.auth[this.key]) {
      // If auth is enabled for this list (doesn't matter what strategy)
      queries.push(`${this.authenticatedQueryName}: ${this.key}`);
    }

    return queries;
  }

  getAdminQueryResolvers() {
    let resolvers = {};

    // If set to false, we can confidently remove these resolvers entirely from
    // the graphql schema
    if (this.acl.read) {
      resolvers = {
        [this.listQueryName]: (...params) => {
          const args = params[1];
          const context = params[2];
          if (
            !checkAccess({
              access: this.acl.read,
              dynamicCheckData: () => ({
                where: args,
                authentication: {
                  item: context.authedItem,
                  listKey: context.authedListKey,
                },
              }),
            })
          ) {
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

          return this.adapter.itemsQuery(args);
        },

        [this.listQueryMetaName]: (_, args, { authedItem, authedListKey }) => {
          const dynamicCheckData = () => ({
            where: args,
            authentication: {
              item: authedItem,
              listKey: authedListKey,
            },
          });

          return {
            // Return these as functions so they're lazily evaluated depending
            // on what the user requested
            // Evalutation takes place in ../Keystone/index.js
            getCount: () => {
              if (!checkAccess({ access: this.acl.read, dynamicCheckData })) {
                // If the client handles errors correctly, it should be able to
                // receive partial data (for the fields the user has access to),
                // and then an `errors` array of AccessDeniedError's
                throw new AccessDeniedError({
                  data: {
                    type: 'query',
                    name: this.listQueryMetaName,
                  },
                  internalData: {
                    authedId: authedItem && authedItem.id,
                    authedListKey: authedListKey,
                  },
                });
              }
              return this.adapter
                .itemsQueryMeta(args)
                .then(({ count }) => count);
            },
          };
        },

        [this.listMetaName]: (_, args, { authedItem, authedListKey }) => {
          const dynamicCheckData = () => ({
            where: args,
            authentication: {
              item: authedItem,
              listKey: authedListKey,
            },
          });

          return {
            // Return these as functions so they're lazily evaluated depending
            // on what the user requested
            // Evalutation takes place in ../Keystone/index.js
            getAccess: () => ({
              create: checkAccess({
                access: this.acl.create,
                dynamicCheckData,
              }),
              read: checkAccess({ access: this.acl.read, dynamicCheckData }),
              update: checkAccess({
                access: this.acl.update,
                dynamicCheckData,
              }),
              delete: checkAccess({
                access: this.acl.delete,
                dynamicCheckData,
              }),
            }),
          };
        },

        [this.itemQueryName]: (_, { where: { id } }, context) => {
          if (
            !checkAccess({
              access: this.acl.read,
              dynamicCheckData: () => ({
                where: { id },
                authentication: {
                  item: context.authedItem,
                  listKey: context.authedListKey,
                },
              }),
            })
          ) {
            // If the client handles errors correctly, it should be able to
            // receive partial data (for the fields the user has access to),
            // and then an `errors` array of AccessDeniedError's
            throw new AccessDeniedError({
              data: {
                type: 'query',
                name: this.itemQueryName,
              },
              internalData: {
                authedId: context.authedItem && context.authedItem.id,
                authedListKey: context.authedListKey,
              },
            });
          }

          // NOTE: The fields will be filtered by the ACL checking in
          // getAdminFieldResolvers()
          return this.adapter.findById(id);
        },
      };
    }

    // NOTE: This query is not effected by the read permissions; if the user can
    // authenticate themselves, then they already have access to know that the
    // list exists
    if (this.keystone.auth[this.key]) {
      resolvers[this.authenticatedQueryName] = (
        _,
        args,
        { authedItem, authedListKey }
      ) => {
        if (!authedItem || authedListKey !== this.key) {
          return null;
        }

        // We filter out any requested fields that they don't have access to
        return this.fields.reduce(
          (filteredData, field) => ({
            ...filteredData,
            [field.path]: checkAccess({
              access: field.acl.read,
              dynamicCheckData: () => ({
                item: authedItem,
                listKey: authedListKey,
              }),
            })
              ? authedItem[field.path]
              : null,
          }),
          {}
        );
      };
    }

    return resolvers;
  }

  wrapFieldQueryResolversWithACL(originalResolvers) {
    return this.fields.reduce(
      (resolvers, field) => {
        const originalResolver = originalResolvers[field.path];

        // The field isn't readable at all, so don't include it
        if (!field.acl.read) {
          return resolvers;
        }

        return {
          ...resolvers,
          // Ensure their's a field resolver for every field
          [field.path]: (item, args, context, ...rest) => {
            // If not allowed access
            if (
              !checkAccess({
                access: field.acl.read,
                dynamicCheckData: () => ({
                  itemId: item ? item.id : null,
                  authentication: {
                    item: context.authedItem,
                    listKey: context.authedListKey,
                  },
                }),
              })
            ) {
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
    if (!this.acl.read) {
      return {};
    }

    const fieldResolvers = this.fields.filter(field => !!field.acl.read).reduce(
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
    if (this.acl.create) {
      mutations.push(`
        ${this.createMutationName}(
          data: ${this.key}CreateInput
        ): ${this.key}
      `);
    }

    if (this.acl.update) {
      mutations.push(`
        ${this.updateMutationName}(
          id: String!
          data: ${this.key}UpdateInput
        ): ${this.key}
      `);
    }

    if (this.acl.delete) {
      mutations.push(`
        ${this.deleteMutationName}(
          id: String!
        ): ${this.key}
      `);

      // TODO: FIXME? Should this return an array of items?
      mutations.push(`
        ${this.deleteManyMutationName}(
          ids: [String!]
        ): ${this.key}
      `);
    }

    return mutations.filter(Boolean);
  }

  throwIfAccessDeniedOnList({
    accessType,
    data,
    item,
    items,
    context: { authedItem, authedListKey },
    errorMeta = {},
    errorMetaForLogging = {},
  }) {
    if (
      !checkAccess({
        access: this.acl[accessType],
        dynamicCheckData: () => ({
          data,
          item,
          items,
          authentication: {
            item: authedItem,
            listKey: authedListKey,
          },
        }),
      })
    ) {
      throw new AccessDeniedError({
        data: errorMeta,
        internalData: {
          authedId: authedItem && authedItem.id,
          authedListKey: authedListKey,
          ...errorMetaForLogging,
        },
      });
    }
  }

  throwIfAccessDeniedOnFields({
    fields,
    accessType,
    id,
    data,
    context: { authedItem, authedListKey },
    errorMeta = {},
    errorMetaForLogging = {},
  }) {
    const idString = id.toString();
    const restrictedFields = [];

    const dynamicData = {
      itemId: idString,
      data,
      authentication: {
        item: authedItem,
        listKey: authedListKey,
      },
    };

    const dynamicDataGetter = () => dynamicData;

    fields.forEach(field => {
      if (!(field.path in data)) {
        return;
      }

      if (
        !checkAccess({
          access: field.acl[accessType],
          dynamicCheckData: dynamicDataGetter,
        })
      ) {
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
          authedId: authedItem && authedItem.id,
          authedListKey: authedListKey,
          ...errorMetaForLogging,
        },
      });
    }
  }

  getAdminMutationResolvers() {
    const mutationResolvers = {};

    if (this.acl.create) {
      mutationResolvers[this.createMutationName] = async (
        _,
        { data },
        context
      ) => {
        this.throwIfAccessDeniedOnList({
          accessType: 'create',
          data,
          context,
          errorMeta: {
            type: 'mutation',
            name: this.createMutationName,
          },
        });

        const resolvedData = await resolveAllKeys(
          Object.keys(data).reduce(
            (resolvers, fieldPath) => ({
              ...resolvers,
              [fieldPath]: this.fieldsByPath[fieldPath].createFieldPreHook(
                data[fieldPath],
                fieldPath
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
              newItem
            )
          )
        );

        return newItem;
      };
    }

    if (this.acl.update) {
      mutationResolvers[this.updateMutationName] = async (
        _,
        { id, data },
        context
      ) => {
        // TODO: Only load this if the ACL is dynamic, and requires it
        const item = await this.adapter.findById(id);

        this.throwIfAccessDeniedOnList({
          accessType: 'update',
          data,
          item,
          context,
          errorMeta: {
            type: 'mutation',
            name: this.updateMutationName,
          },
          errorMetaForLogging: {
            itemId: id,
          },
        });

        this.throwIfAccessDeniedOnFields({
          fields: this.fields,
          accessType: 'update',
          id,
          data,
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
                item
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
          {
            // Return the modified item, not the original
            new: true,
          }
        );

        await Promise.all(
          Object.keys(data).map(fieldPath =>
            this.fieldsByPath[fieldPath].updateFieldPostHook(
              newItem[fieldPath],
              fieldPath,
              newItem
            )
          )
        );

        return newItem;
      };
    }

    if (this.acl.delete) {
      mutationResolvers[this.deleteMutationName] = async (
        _,
        { id },
        context
      ) => {
        // TODO: Only load this if the ACL is dynamic, and requires it
        const item = await this.adapter.findById(id);

        this.throwIfAccessDeniedOnList({
          accessType: 'delete',
          item,
          context,
          errorMeta: {
            type: 'mutation',
            name: this.deleteMutationName,
          },
          errorMetaForLogging: {
            itemId: id,
          },
        });

        return this.adapter.delete(id);
      };

      mutationResolvers[this.deleteManyMutationName] = async (
        _,
        { ids },
        context
      ) => {
        const items = await Promise.all(
          ids.map(id => this.adapter.findById(id))
        );
        this.throwIfAccessDeniedOnList({
          accessType: 'delete',
          items,
          context,
          errorMeta: {
            type: 'mutation',
            name: this.deleteManyMutationName,
          },
          errorMetaForLogging: {
            itemIds: ids,
          },
        });

        return Promise.all(ids.map(id => this.adapter.delete(id)));
      };
    }

    return mutationResolvers;
  }
};
