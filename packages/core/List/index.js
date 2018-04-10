const inflection = require('inflection');
const pluralize = require('pluralize');

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
          return new type(path, fieldSpec);
        })
      : [];

    const schema = new mongoose.Schema({}, this.config.mongooseSchemaOptions);
    this.fields.forEach(i => i.addToMongooseSchema(schema));

    if (this.config.configureMongooseSchema) {
      this.config.configureMongooseSchema(schema, { mongoose, lists });
    }

    this.model = mongoose.model(this.key, schema);
  }
  getAdminQueries() {
    return `
      ${this.listQueryName}: [${this.key}]
      ${this.itemQueryName}(id: String!): ${this.key}`;
  }
  getAdminSchemaType() {
    return `
      type ${this.key} {
        id: String
        ${this.fields.map(i => i.getGraphqlSchema()).join('\n        ')}
      }
    `;
  }
  getAdminResolvers() {
    return {
      [this.listQueryName]: () => this.model.find(),
      [this.itemQueryName]: (_, { id }) => this.model.findById(id),
    };
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
    };
  }
};
