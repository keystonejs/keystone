const pluralize = require('pluralize');
const { resolveAllKeys, escapeRegExp } = require('@keystonejs/utils');

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
    const queryArgs = this.fields
      .map(i => i.getGraphqlQueryArgs())
      .filter(i => i)
      .map(i => i.split(/\n\s+/g).join('\n          '))
      .join('\n          # New field\n          ');
    const commonArgs = `
          search: String
          sort: String

          # Pagination
          first: Int
          skip: Int`;
    // TODO: Group field filters under filter: FilterInput
    return [
      `
        ${this.listQueryName}(${commonArgs}

          # Field Filters
          ${queryArgs}
        ): [${this.key}]

        ${this.itemQueryName}(id: String!): ${this.key}

        ${this.listQueryMetaName}(${commonArgs}

          # Field Filters
          ${queryArgs}
        ): _QueryMeta
      `,
      ...this.fields
        .map(field => field.getGraphqlAuxiliaryQueries())
        .filter(Boolean),
    ];
  }
  getAdminQueryResolvers() {
    return {
      [this.listQueryName]: (_, args) => this.buildItemsQuery(args),
      [this.listQueryMetaName]: (_, args) => this.buildItemsQueryMeta(args),
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
        return this.model.create(data);
      },
      [this.updateMutationName]: async (_, { id, data }) => {
        const item = await this.model.findById(id);

        const resolvedData = await resolveAllKeys(this.fields.reduce(
          (resolvers, field) => ({
            ...resolvers,
            [field.path]: field.updateFieldPreHook(data[field.path], item),
          }),
          {}
        ));

        item.set(resolvedData);
        const newItem = await item.save();

        await Promise.all(this.fields.map(
          field => field.updateFieldPostHook(item[field.path], newItem)
        ));

        return newItem;
      },
      [this.deleteMutationName]: (_, { id }) =>
        this.model.findByIdAndRemove(id),
      [this.deleteManyMutationName]: async (_, { ids }) => {
        ids.map(async id => await this.model.findByIdAndRemove(id));
      },
    };
  }
  buildItemsQuery(args) {
    let conditions = this.fields.reduce((conds, field) => {
      const fieldConditions = field.getQueryConditions(args);
      if (!fieldConditions.length) return conds;
      return [...conds, ...fieldConditions.map(i => ({ [field.path]: i }))];
    }, []);
    if (args.search) {
      // TODO: Implement configurable search fields for lists
      conditions.push({
        name: new RegExp(`^${escapeRegExp(args.search)}`, 'i'),
      });
    }
    if (!conditions.length) conditions = undefined;
    else if (conditions.length === 1) conditions = conditions[0];
    else conditions = { $and: conditions };

    const query = this.model.find(conditions);

    if (args.sort) {
      query.sort(args.sort);
    }

    if (args.first) {
      query.limit(args.first);
    }
    if (args.skip) {
      query.skip(args.skip);
    }
    return query;
  }
  buildItemsQueryMeta(args) {
    return new Promise((resolve, reject) => {
      this.buildItemsQuery(args).count((err, count) => {
        if (err) reject(err);
        resolve({ count });
      });
    });
  }
};
