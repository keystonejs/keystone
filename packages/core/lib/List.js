const inflection = require('inflection');
const pluralize = require('pluralize');

module.exports = class List {
  constructor(key, config) {
    this.key = key;
    this.config = config;

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
          const field = new type(path, fieldSpec);
          return field;
        })
      : [];
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
