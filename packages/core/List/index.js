const inflection = require('inflection');
const nodePath = require('path');
const pluralize = require('pluralize');
const { escapeRegExp } = require('@keystonejs/utils');

const initConfig = (key, config) => ({
  ...config,
});

module.exports = class List {
  constructor(key, config, { mongoose, lists }) {
    this.key = key;
    this.config = initConfig(key, config);

    this.label = config.label || inflection.titleize(key);
    this.singular = config.singular || pluralize.singular(this.label);
    this.plural = config.singular || pluralize.plural(this.label);
    this.path = config.path || inflection.dasherize(this.plural).toLowerCase();
    this.listQueryName =
      config.listQueryName || inflection.camelize(this.plural, true);
    this.itemQueryName =
      config.itemQueryName || inflection.camelize(this.singular, true);

    this.fields = config.fields
      ? Object.keys(config.fields).map(path => {
          const { type, ...fieldSpec } = config.fields[path];
          const implementation = type.implementation;
          return new implementation(path, { ...fieldSpec, listKey: key });
        })
      : [];

    this.views = {};
    Object.entries(config.fields).forEach(([path, fieldConfig]) => {
      const defaultFieldViews = fieldConfig.type.views;
      const defaultFieldViewsBasePath = fieldConfig.type.basePath;
      this.views[path] = {};

      Object.entries(defaultFieldViews).forEach(([fieldViewType, fieldViewPath]) => {
        // Allow the config to override the fields view path
        if (fieldConfig.views && fieldConfig.views[fieldViewType]) {
          this.views[path][fieldViewType] = fieldConfig.views[fieldViewType];
        } else {
          const resolvedPath = nodePath.resolve(nodePath.join(defaultFieldViewsBasePath, fieldViewPath));
          this.views[path][fieldViewType] = resolvedPath;
        }
      });
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
  getAdminResolvers() {
    return {
      [this.listQueryName]: (_, args) => this.buildItemsQuery(args),
      [this.itemQueryName]: (_, { id }) => this.model.findById(id),
    };
  }
  buildItemsQuery(args) {
    const query = this.model.find();
    this.fields.forEach(i => i.addFiltersToQuery(query, args));
    if (args.search) {
      query.where('name', new RegExp(`^${escapeRegExp(args.search)}`, 'i'));
    }
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
      fields: this.fields.map(i => i.getAdminMeta()),
      views: this.views
    };
  }
};
