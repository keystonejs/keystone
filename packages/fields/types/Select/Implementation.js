const inflection = require('inflection');
const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');

function initOptions(options) {
  let optionsArray = options;
  if (typeof options === 'string') optionsArray = options.split(/\,\s*/);
  if (!Array.isArray(optionsArray)) return null;
  return optionsArray.map(i => {
    return typeof i === 'string' ? { value: i, label: inflection.humanize(i) } : i;
  });
}

class Select extends Implementation {
  constructor(path, config) {
    super(...arguments);
    this.options = initOptions(config.options);
  }
  get gqlOutputFields() {
    return [`${this.path}: ${this.getTypeName()}`];
  }
  get gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  getTypeName() {
    return `${this.listKey}${inflection.classify(this.path)}Type`;
  }
  get gqlAuxTypes() {
    // TODO: I'm really not sure it's safe to generate GraphQL Enums from
    // whatever options people provide, this could easily break with spaces and
    // special characters in values so may not be worth it...
    return [
      `
      enum ${this.getTypeName()} {
        ${this.options.map(i => i.value).join('\n        ')}
      }
    `,
    ];
  }

  extendAdminMeta(meta) {
    return { ...meta, options: this.options };
  }
  get gqlQueryInputFields() {
    return [
      ...this.equalityInputFields(this.getTypeName()),
      ...this.inInputFields(this.getTypeName()),
    ];
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: ${this.getTypeName()}`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: ${this.getTypeName()}`];
  }
}

class MongoSelectInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    schema.add({ [this.path]: this.mergeSchemaOptions({ type: String }, this.config) });
  }

  getQueryConditions() {
    return {
      ...this.equalityConditions(),
      ...this.inConditions(),
    };
  }
}

module.exports = {
  Select,
  MongoSelectInterface,
};
