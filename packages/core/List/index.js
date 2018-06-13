const {
  Types: { ObjectId },
} = require('mongoose');
const pluralize = require('pluralize');
const {
  parseACL,
  checkAccess,
  resolveAllKeys,
  escapeRegExp,
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

function getIdQueryConditions(args) {
  const conditions = [];
  if (!args) {
    return conditions;
  }
  // id is how it looks in the schema
  if ('id' in args) {
    // _id is how it looks in the MongoDB
    conditions.push({ _id: { $eq: ObjectId(args.id) } });
  }
  // id is how it looks in the schema
  if ('id_not' in args) {
    // _id is how it looks in the MongoDB
    conditions.push({ _id: { $ne: ObjectId(args.id_not) } });
  }
  return conditions;
}

function isIdQueryArg(arg) {
  return ['id', 'id_not'].indexOf(arg) !== -1;
}

module.exports = class List {
  constructor(key, config, { getListByKey, mongoose, keystone }) {
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
    this.authenticatedQueryName = `authenticated${itemQueryName}`;
    this.deleteMutationName = `delete${itemQueryName}`;
    this.deleteManyMutationName = `delete${listQueryName}`;
    this.updateMutationName = `update${itemQueryName}`;
    this.createMutationName = `create${itemQueryName}`;

    const accessTypes = ['create', 'read', 'update', 'delete'];

    // Starting with the default, extend it with any config passed in
    this.acl = {
      ...pick(keystone.defaultAccess, accessTypes),
      ...parseACL(config.access, {
        accessTypes,
        listKey: key,
      }),
    };

    this.fields = config.fields
      ? Object.keys(config.fields).map(path => {
          const { type, ...fieldSpec } = config.fields[path];
          const implementation = type.implementation;
          return new implementation(path, fieldSpec, {
            getListByKey,
            listKey: key,
            defaultAccess: this.acl,
          });
        })
      : [];

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

    const schema = new mongoose.Schema({}, this.config.mongooseSchemaOptions);
    this.fields.forEach(i => i.addToMongooseSchema(schema, mongoose));

    if (this.config.configureMongooseSchema) {
      this.config.configureMongooseSchema(schema, { mongoose });
    }

    this.model = mongoose.model(this.key, schema);
  }
  getAdminMeta() {
    return {
      key: this.key,
      label: this.label,
      singular: this.singular,
      plural: this.plural,
      path: this.path,
      listQueryName: this.listQueryName,
      listQueryMetaName: this.listQueryMetaName,
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
      .join('\n        ');

    const fieldTypes = this.fields
      .map(i => i.getGraphqlAuxiliaryTypes())
      .filter(i => i);

    const updateArgs = this.fields
      // If it's globally set to false, makes sense to never let it be updated
      .filter(field => !!field.acl.update)
      .map(field => field.getGraphqlUpdateArgs())
      .filter(i => i)
      .map(i => i.split(/\n\s+/g).join('\n        '))
      .join('\n        ')
      .trim();

    const createArgs = this.fields
      .map(i => i.getGraphqlCreateArgs())
      .filter(i => i)
      .map(i => i.split(/\n\s+/g).join('\n        '))
      .join('\n        ')
      .trim();

    const queryArgs = this.fields
      // If it's globally set to false, makes sense to never show it
      .filter(field => !!field.acl.read)
      .map(field => {
        const fieldQueryArgs = field
          .getGraphqlQueryArgs()
          .split(/\n\s+/g)
          .join('\n        ');

        if (!fieldQueryArgs) {
          return null;
        }

        return `# ${field.constructor.name} field\n        ${fieldQueryArgs}`;
      })
      .filter(Boolean)
      .join('\n\n        ');

    return [
      `
      type ${this.key} {
        id: String
        # This virtual field will be resolved in one of the following ways (in this order):
        # 1. Execution of 'labelResolver' set on the ${this.key} List config, or
        # 2. As an alias to the field set on 'labelField' in the ${
          this.key
        } List config, or
        # 3. As an alias to a 'name' field on the ${
          this.key
        } List (if one exists), or
        # 4. As an alias to the 'id' field on the ${this.key} List.
        _label_: String
        ${fieldSchemas}
      }
      `,
      // TODO: AND / OR filters:
      // https://github.com/opencrud/opencrud/blob/master/spec/2-relational/2-2-queries/2-2-3-filters.md#boolean-expressions
      `
      input ${this.itemQueryName}WhereInput {
        id: ID
        id_not: ID
        ${queryArgs}
      }
      `,
      `
      input ${this.itemQueryName}WhereUniqueInput {
        id: ID!
      }
      `,
      `
      input ${this.key}UpdateInput {
        ${updateArgs}
      }
      `,
      `
      input ${this.key}CreateInput {
        ${createArgs}
      }
      `,
      ...fieldTypes,
    ];
  }

  getAdminGraphqlQueries() {
    // TODO: Follow OpenCRUD naming:
    // https://github.com/opencrud/opencrud/blob/master/spec/2-relational/2-2-queries/2-2-1-toplevel.md#example
    // TODO: make sorting like OpenCRUD:
    /*
orderBy: UserOrderByInput
...
enum UserOrderByInput {
id_ASC
id_DESC
name_ASC
name_DESC
updatedAt_ASC
updatedAt_DESC
createdAt_ASC
createdAt_DESC
}
*/
    const commonArgs = `
          search: String
          sort: String

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
      queries.push(`
        ${this.listQueryName}(
          where: ${this.itemQueryName}WhereInput

          ${commonArgs.trim()}
        ): [${this.key}]

        ${this.itemQueryName}(where: ${this.itemQueryName}WhereUniqueInput!): ${
        this.key
      }

        ${this.listQueryMetaName}(
          where: ${this.itemQueryName}WhereInput

          ${commonArgs.trim()}
        ): _QueryMeta
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
        [this.listQueryName]: (_, args, context) => {
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
            // TODO: Return an error of some kind aswell so the client isn't in
            // the dark about why there's no results?
            return [];
          }

          return this.itemsQuery(args, context);
        },

        [this.listQueryMetaName]: (_, args, { authedItem, authedListKey }) => {
          if (
            !checkAccess({
              access: this.acl.read,
              dynamicCheckData: () => ({
                where: args,
                authentication: {
                  item: authedItem,
                  listKey: authedListKey,
                },
              }),
            })
          ) {
            // TODO: Return an error of some kind aswell so the client isn't in
            // the dark about why there's no results?
            return [];
          }

          return this.itemsQueryMeta(args);
        },

        [this.itemQueryName]: (
          _,
          { where: { id } },
          { authedItem, authedListKey }
        ) => {
          if (
            !checkAccess({
              access: this.acl.read,
              dynamicCheckData: () => ({
                where: { id },
                authentication: {
                  item: authedItem,
                  listKey: authedListKey,
                },
              }),
            })
          ) {
            // TODO: Return an error of some kind aswell so the client isn't in
            // the dark about why there's no results?
            return null;
          }

          // NOTE: The fields will be filtered by the ACL checking in
          // getAdminFieldResolvers()
          return this.model.findById(id);
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
          data: ${this.key}UpdateInput
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
    context: { authedItem, authedListKey },
    errorMeta = {},
    errorMetaForLogging = {},
  }) {
    if (
      !checkAccess({
        access: this.acl[accessType],
        dynamicCheckData: () => ({
          data,
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
    data,
    context: { authedItem, authedListKey },
    errorMeta = {},
    errorMetaForLogging = {},
  }) {
    const restrictedFields = [];

    fields.forEach(field => {
      if (!field.path in data) {
        return;
      }

      if (
        !checkAccess({
          access: field.acl[accessType],
          dynamicCheckData: () => ({
            item: authedItem,
            listKey: authedListKey,
          }),
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
    return {
      [this.createMutationName]: async (_, { data }, context) => {
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
          this.fields.reduce(
            (resolvers, field) => ({
              ...resolvers,
              [field.path]: field.createFieldPreHook(
                data[field.path],
                field.path
              ),
            }),
            {}
          )
        );

        const newItem = await this.model.create(resolvedData);

        await Promise.all(
          this.fields.map(field =>
            field.createFieldPostHook(newItem[field.path], field.path, newItem)
          )
        );

        return newItem;
      },

      [this.updateMutationName]: async (_, { id, data }, context) => {
        this.throwIfAccessDeniedOnList({
          accessType: 'update',
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

        this.throwIfAccessDeniedOnFields({
          fields: this.fields,
          accessType: 'update',
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

        const item = await this.model.findById(id);

        const resolvedData = await resolveAllKeys(
          this.fields.reduce(
            (resolvers, field) => ({
              ...resolvers,
              [field.path]: field.updateFieldPreHook(
                data[field.path],
                field.path,
                item
              ),
            }),
            {}
          )
        );

        item.set(resolvedData);
        const newItem = await item.save();

        await Promise.all(
          this.fields.map(field =>
            field.updateFieldPostHook(newItem[field.path], field.path, newItem)
          )
        );

        return newItem;
      },

      [this.deleteMutationName]: (_, { id }, context) => {
        this.throwIfAccessDeniedOnList({
          accessType: 'delete',
          context,
          errorMeta: {
            type: 'mutation',
            name: this.deleteMutationName,
          },
          errorMetaForLogging: {
            itemId: id,
          },
        });

        return this.model.findByIdAndRemove(id);
      },

      [this.deleteManyMutationName]: async (_, { ids }) => {
        this.throwIfAccessDeniedOnList({
          accessType: 'delete',
          context,
          errorMeta: {
            type: 'mutation',
            name: this.deleteManyMutationName,
          },
          errorMetaForLogging: {
            itemIds: ids,
          },
        });

        return Promise.all(ids.map(id => this.model.findByIdAndRemove(id)));
      },
    };
  }

  itemsQueryConditions(args, depthGuard = 0) {
    if (!args) {
      return [];
    }

    // TODO: can depthGuard be an instance variable, to track the recursion
    // depth instead of passing it through to the individual fields and back
    // again?
    if (depthGuard > 1) {
      throw new Error(
        'Nesting where args deeper than 1 level is not currently supported'
      );
    }

    return this.fields.reduce(
      (conds, field) => {
        const fieldConditions = field.getQueryConditions(
          args,
          this,
          depthGuard + 1
        );

        if (fieldConditions && !Array.isArray(fieldConditions)) {
          console.warn(
            `${field.listKey}.${field.path} (${
              field.constructor.name
            }) returned a non-array for .getQueryConditions(). This is probably a mistake. Ignoring.`
          );
          return conds;
        }

        // Nothing to do
        if (!fieldConditions || !fieldConditions.length) {
          return conds;
        }

        return [
          ...conds,
          ...fieldConditions.map(condition => {
            if (condition.$isComplexStage) {
              return condition;
            }
            return { [field.path]: condition };
          }),
        ];
      },
      // Special case for `_id` where it presents as `id` in the graphQL schema,
      // and isn't a field type
      getIdQueryConditions(args)
    );
  }

  itemsQuery(args, context) {
    // To avoid accidentially indirectly leaking information, we need to remove
    // the where clauses that are not allowed by the ACL
    function allowedToFilterBy(clause) {
      const filteredField = this.fields.find(field =>
        field.isGraphqlQueryArg(clause)
      );

      if (!filteredField) {
        // try id fields
        // TODO: FIXME: How dafuq we check the id ACL? There's no ID field... Maybe
        // there should be!
        if (!filteredField) {
          // Something went horribly wrong - no fields reported that this clause
          // belongs to them, which should be impossible unless the field itself
          // is poorly configured.
          console.error(
            `Unable to locate field responsible for the where clause '${clause}' on list ${
              this.key
            }.\n Ensure all field types in use on ${
              this.key
            } list correctly implement isGraphqlQueryArg(). Removing from query.`
          );
          return false;
        }
      }

      return checkAccess({
        access: filteredField.acl.read,
        dynamicCheckData: () => ({
          item: context.authedItem,
          listKey: context.authedListKey,
        }),
      });
    }

    const where = Object.keys(args.where).reduce((filteredWhere, clause) => {
      // TODO: Include some kind of error in the response when not alloweed so
      // the user isn't confused why some filters are working and others not?
      if (allowedToFilterBy(clause)) {
        filteredWhere[clause] = args.where[clause];
      }
      return filteredWhere;
    }, {});
    const conditions = this.itemsQueryConditions(where);

    const pipeline = [];
    const postAggregateMutation = [];

    // NOTE: Using a for..of loop here would complicate the code as we move the
    // iterator forward within two separate sub-loops
    // TODO: Order isn't important. Might as well put all the simple `$match`s
    // first, and complex ones last.
    let iterator = conditions[Symbol.iterator]();
    let itr = iterator.next();
    while (!itr.done) {
      // Gather up all the simple matches
      let simpleMatches = [];
      while (!itr.done && !itr.value.$isComplexStage) {
        simpleMatches.push(itr.value);
        itr = iterator.next();
      }

      if (simpleMatches.length) {
        pipeline.push({
          $match: {
            $and: simpleMatches,
          },
        });
      }

      // Push all the complex stages onto the pipeline as-is
      while (!itr.done && itr.value.$isComplexStage) {
        pipeline.push(...itr.value.pipeline);
        if (itr.value.mutator) {
          postAggregateMutation.push(itr.value.mutator);
        }
        itr = iterator.next();
      }
    }

    if (args.search) {
      // TODO: Implement configurable search fields for lists
      pipeline.push({
        $match: {
          name: new RegExp(`${escapeRegExp(args.search)}`, 'i'),
        },
      });
    }

    if (args.orderBy) {
      const [orderField, orderDirection] = args.orderBy.split('_');

      pipeline.push({
        $sort: {
          [orderField]: orderDirection === 'ASC' ? 1 : -1,
        },
      });
    }

    if (args.skip < Infinity && args.skip > 0) {
      pipeline.push({
        $skip: args.skip,
      });
    }

    if (args.first < Infinity && args.first > 0) {
      pipeline.push({
        $limit: args.first,
      });
    }

    if (!pipeline.length) {
      return this.model.find();
    }

    // Map _id => id
    // Normally, mongoose would do this for us, but because we're breaking out
    // and going straight Mongo, gotta do it ourselves.
    pipeline.push({
      $addFields: {
        id: '$_id',
      },
    });

    return this.model
      .aggregate(pipeline)
      .exec()
      .then(data =>
        data
          .map((item, index, list) =>
            // Iterate over all the mutations
            postAggregateMutation.reduce(
              // And pass through the result to the following mutator
              (mutatedItem, mutation) => mutation(mutatedItem, index, list),
              // Starting at the original item
              item
            )
          )
          // If anything gets removed, we clear it out here
          .filter(Boolean)
      );
  }
  itemsQueryMeta(args, context) {
    return new Promise((resolve, reject) => {
      this.itemsQuery(args, context).count((err, count) => {
        if (err) reject(err);
        resolve({ count });
      });
    });
  }
};
