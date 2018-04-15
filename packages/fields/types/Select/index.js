const inflection = require('inflection');
const Field = require('../../Field');

function initOptions(options) {
  let optionsArray = options;
  if (typeof options === 'string') optionsArray = options.split(/\,\s*/);
  if (!Array.isArray(optionsArray)) return null;
  return optionsArray.map(i => {
    return typeof i === 'string'
      ? { value: i, label: inflection.humanize(i) }
      : i;
  });
}

module.exports = class Select extends Field {
  constructor(path, config) {
    super(path, config);
    this.options = initOptions(config.options);
    this.views = {
      Field: './views/Field'
    };
    this.basePath = __dirname;
  }
  getGraphqlSchema() {
    return `${this.path}: ${this.getTypeName()}`;
  }
  getTypeName() {
    return `${this.listKey}${inflection.classify(this.path)}Type`;
  }
  getGraphqlTypes() {
    // TODO: I'm really not sure it's safe to generate GraphQL Enums from
    // whatever options people provide, this could easily break with spaces and
    // special characters in values so may not be worth it...
    return `
      enum ${this.getTypeName()} {
        ${this.options.map(i => i.value).join('\n        ')}
      }
    `;
  }
  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    schema.add({
      [this.path]: { type: String, ...mongooseOptions },
    });
  }
  extendAdminMeta(meta) {
    return { ...meta, options: this.options };
  }
};
