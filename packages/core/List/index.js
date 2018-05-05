const pluralize = require('pluralize');
const { escapeRegExp } = require('@keystonejs/utils');

const initConfig = (key, config) => ({
  ...config,
});

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
  constructor(key, config, { mongoose, lists }) {
    this.key = key;
    this.config = initConfig(key, config);

    const label = keyToLabel(key);
    const singular = pluralize.singular(label);
    const plural = pluralize.plural(label);

    this.label = config.label || plural;
    this.singular = config.singular || singular;
    this.plural = config.plural || plural;
    this.path = config.path || labelToPath(plural);

    const itemQueryName = config.itemQueryName || labelToClass(singular);
    const listQueryName = config.listQueryName || labelToClass(plural);

    this.itemQueryName = itemQueryName;
    this.listQueryName = `all${listQueryName}`;
    this.deleteMutationName = `delete${itemQueryName}`;
    this.deleteManyMutationName = `delete${listQueryName}`;
    this.updateMutationName = `update${itemQueryName}`;
    this.createMutationName = `create${itemQueryName}`;

    this.fields = config.fields
      ? Object.keys(config.fields).map(path => {
          const { type, ...fieldSpec } = config.fields[path];
          const implementation = type.implementation;
          return new implementation(path, { ...fieldSpec, listKey: key });
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
    this.fields.forEach(i => i.addToMongooseSchema(schema));

    if (this.config.configureMongooseSchema) {
      this.config.configureMongooseSchema(schema, { mongoose, lists });
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
      .map(i => i.getGraphqlTypes())
      .filter(i => i)
      .join('\n     ');
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
    return `
      type ${this.key} {
        id: String
        ${fieldSchemas}
      }
      input ${this.key}UpdateInput {
        ${updateArgs}
      }
      input ${this.key}CreateInput {
        ${createArgs}
      }
      ${fieldTypes}
    `;
  }
  getAdminGraphqlQueries() {
    const queryArgs = this.fields
      .map(i => i.getGraphqlQueryArgs())
      .filter(i => i)
      .map(i => i.split(/\n\s+/g).join('\n          '))
      .join('');
    return `
        ${this.listQueryName}(
          search: String
          sort: String
          ${queryArgs}
        ): [${this.key}]
        ${this.itemQueryName}(id: String!): ${this.key}
    `;
  }
  getAdminQueryResolvers() {
    return {
      [this.listQueryName]: (_, args) => this.buildItemsQuery(args),
      [this.itemQueryName]: (_, { id }) => this.model.findById(id),
    };
  }
  getAdminGraphqlMutations() {
    return `
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
    `;
  }
  getAdminMutationResolvers() {
    return {
      [this.createMutationName]: async (_, { data }) => {
        return this.model.create(data);
      },
      [this.updateMutationName]: async (_, { id, data }) => {
        const item = await this.model.findById(id);
        // TODO: Loop through each field and have it apply the update
        item.set(data);
        return item.save();
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
    return query;
  }
};
