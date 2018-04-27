const inflection = require('inflection');
const pluralize = require('pluralize');
const { escapeRegExp } = require('@keystonejs/utils');

const initConfig = (key, config) => ({
  ...config,
});

module.exports = class List {
  constructor(key, config, { mongoose, lists }) {
    this.key = key;
    this.config = initConfig(key, config);

    this.label = config.label || pluralize.plural(inflection.titleize(key));
    this.singular = config.singular || pluralize.singular(this.label);
    this.plural = config.plural || pluralize.plural(this.label);
    this.path = config.path || inflection.dasherize(this.plural).toLowerCase();
    this.itemQueryName =
      config.itemQueryName || inflection.camelize(this.singular);
    this.listQueryName =
      config.listQueryName || `all${inflection.camelize(this.plural)}`;
    this.deleteMutationName = `delete${this.itemQueryName}`;

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
  getAdminGraphqlTypes() {
    const fieldSchemas = this.fields.map(i => i.getGraphqlSchema());
    const fieldTypes = this.fields.map(i => i.getGraphqlTypes()).filter(j => j);
    return `
      type ${this.key} {
        id: String
        ${fieldSchemas.join('\n        ')}
      }
      ${fieldTypes.join('\n     ')}
    `;
  }
  getAdminGraphqlQueries() {
    const listQueryArgs = this.fields
      .map(i => i.getGraphqlQueryArgs())
      .filter(i => i)
      .join('\n');
    const listQueryArgString = `(search: String sort: String ${listQueryArgs})`;
    return `
        ${this.listQueryName}${listQueryArgString}: [${this.key}]
        ${this.itemQueryName}(id: String!): ${this.key}`;
  }
  getAdminQueryResolvers() {
    return {
      [this.listQueryName]: (_, args) => this.buildItemsQuery(args),
      [this.itemQueryName]: (_, { id }) => this.model.findById(id),
    };
  }
  getAdminGraphqlMutations() {
    return `
        ${this.deleteMutationName}(id: String!): ${this.key}`;
  }
  getAdminMutationResolvers() {
    return {
      [this.deleteMutationName]: (_, { id }) =>
        this.model.findByIdAndRemove(id),
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
  getAdminMeta() {
    return {
      key: this.key,
      label: this.label,
      singular: this.singular,
      plural: this.plural,
      path: this.path,
      listQueryName: this.listQueryName,
      itemQueryName: this.itemQueryName,
      deleteMutationName: this.deleteMutationName,
      fields: this.fields.map(i => i.getAdminMeta()),
      views: this.views,
    };
  }
};
