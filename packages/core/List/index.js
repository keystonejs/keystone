const pluralize = require('pluralize');
const { resolveAllKeys } = require('@keystonejs/utils');

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

module.exports = class List {
  constructor(key, config, { getListByKey, mongoose }) {
    this.key = key;

    this.config = {
      labelResolver: item => item[config.labelField || 'name'] || item.id,
      ...config,
    };
    this.getListByKey = getListByKey;

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
    this.deleteMutationName = `delete${itemQueryName}`;
    this.deleteManyMutationName = `delete${listQueryName}`;
    this.updateMutationName = `update${itemQueryName}`;
    this.createMutationName = `create${itemQueryName}`;

    this.fields = config.fields
      ? Object.keys(config.fields).map(path => {
          const { type, ...fieldSpec } = config.fields[path];
          const implementation = type.implementation;
          return new implementation(path, fieldSpec, {
            getListByKey,
            listKey: key,
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
      .map(i => i.getGraphqlSchema())
      .join('\n        ');

    const fieldTypes = this.fields
      .map(i => i.getGraphqlAuxiliaryTypes())
      .filter(i => i);

    const updateArgs = this.fields
      .map(i => i.getGraphqlUpdateArgs())
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
        ${queryArgs}
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

    return [
      `
        ${this.listQueryName}(
          where: ${this.itemQueryName}WhereInput

          ${commonArgs.trim()}
        ): [${this.key}]

        ${this.itemQueryName}(id: String!): ${this.key}

        ${this.listQueryMetaName}(
          where: ${this.itemQueryName}WhereInput

          ${commonArgs.trim()}
        ): _QueryMeta
      `,
      ...this.fields
        .map(field => field.getGraphqlAuxiliaryQueries())
        .filter(Boolean),
    ];
  }
  getAdminQueryResolvers() {
    return {
      [this.listQueryName]: (_, args) => this.itemsQuery(args),
      [this.listQueryMetaName]: (_, args) => this.itemsQueryMeta(args),
      [this.itemQueryName]: (_, { id }) => this.model.findById(id),
    };
  }
  getAdminFieldResolvers() {
    const fieldResolvers = this.fields.reduce(
      (resolvers, field) => ({
        ...resolvers,
        ...field.getGraphqlFieldResolvers(),
      }),
      {
        _label_: this.config.labelResolver,
      }
    );
    return { [this.key]: fieldResolvers };
  }
  getAuxiliaryTypeResolvers() {
    return this.fields.reduce(
      (resolvers, field) => ({
        ...resolvers,
        ...field.getGraphqlAuxiliaryTypeResolvers(),
      }),
      {}
    );
  }
  getAuxiliaryQueryResolvers() {
    return this.fields.reduce(
      (resolvers, field) => ({
        ...resolvers,
        ...field.getGraphqlAuxiliaryQueryResolvers(),
      }),
      {}
    );
  }
  getAuxiliaryMutationResolvers() {
    return this.fields.reduce(
      (resolvers, field) => ({
        ...resolvers,
        ...field.getGraphqlAuxiliaryMutationResolvers(),
      }),
      {}
    );
  }
  getAdminGraphqlMutations() {
    return [
      `
        ${this.createMutationName}(
          data: ${this.key}UpdateInput
        ): ${this.key}
        ${this.updateMutationName}(
          id: String!
          data: ${this.key}UpdateInput
        ): ${this.key}
        ${this.deleteMutationName}(
          id: String!
        ): ${this.key}
        ${this.deleteManyMutationName}(
          ids: [String!]
        ): ${this.key}
      `,
      ...this.fields
        .map(field => field.getGraphqlAuxiliaryMutations())
        .filter(Boolean),
    ];
  }
  getAdminMutationResolvers() {
    return {
      [this.createMutationName]: async (_, { data }) => {
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
      [this.updateMutationName]: async (_, { id, data }) => {
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
      [this.deleteMutationName]: (_, { id }) =>
        this.model.findByIdAndRemove(id),
      [this.deleteManyMutationName]: async (_, { ids }) => {
        ids.map(async id => await this.model.findByIdAndRemove(id));
      },
    };
  }
  itemsQueryConditions(args, depthGuard = 0) {
    // TODO: can depthGuard be an instance variable, to track the recursion
    // depth instead of passing it through to the individual fields and back
    // again?
    if (depthGuard > 1) {
      throw new Error(
        'Nesting where args deeper than 1 level is not currently supported'
      );
    }

    return this.fields.reduce((conds, field) => {
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
    }, []);
  }
  itemsQuery(args) {
    // TODO: FIXME - should always be args.where
    const conditions = this.itemsQueryConditions(args.where || args);

    const pipeline = [];
    const postAggregateMutation = [];

    // TODO: Order isn't important. Might as well put all the simple `$match`s
    // first, and complex ones last.
    // TODO: Change this to a `for...of` loop
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

    if (args.limit < Infinity && args.limit > 0) {
      pipeline.push({
        $limit: args.limit,
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
  itemsQueryMeta(args) {
    return new Promise((resolve, reject) => {
      this.itemsQuery(args).count((err, count) => {
        if (err) reject(err);
        resolve({ count });
      });
    });
  }
};
