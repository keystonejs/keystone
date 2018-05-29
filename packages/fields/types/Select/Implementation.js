const inflection = require('inflection');
const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapters/mongoose');

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

class Select extends Implementation {
  constructor(path, config) {
    super(...arguments);
    this.options = initOptions(config.options);
  }
  getGraphqlSchema() {
    return `${this.path}: ${this.getTypeName()}`;
  }
  getTypeName() {
    return `${this.listKey}${inflection.classify(this.path)}Type`;
  }
  getGraphqlAuxiliaryTypes() {
    // TODO: I'm really not sure it's safe to generate GraphQL Enums from
    // whatever options people provide, this could easily break with spaces and
    // special characters in values so may not be worth it...
    return `
      enum ${this.getTypeName()} {
        ${this.options.map(i => i.value).join('\n        ')}
      }
    `;
  }

  extendAdminMeta(meta) {
    return { ...meta, options: this.options };
  }
  getGraphqlQueryArgs() {
    return `
      ${this.path}: ${this.getTypeName()}
      ${this.path}_not: ${this.getTypeName()}
      ${this.path}_in: [${this.getTypeName()}!]
      ${this.path}_not_in: [${this.getTypeName()}!]
    `;
  }
  getGraphqlUpdateArgs() {
    return `
      ${this.path}: ${this.getTypeName()}
    `;
  }
  getGraphqlCreateArgs() {
    return `
      ${this.path}: ${this.getTypeName()}
    `;
  }
}

class MongoSelectInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    schema.add({
      [this.path]: { type: String, ...mongooseOptions },
    });
  }

  getQueryConditions(args) {
    const conditions = [];
    const eq = this.path;
    if (eq in args) {
      conditions.push({ $eq: args[eq] });
    }
    const not = `${this.path}_not`;
    if (not in args) {
      conditions.push({ $ne: args[not] });
    }
    const is_in = `${this.path}_in`;
    if (is_in in args) {
      conditions.push({ $in: args[is_in] });
    }
    const not_in = `${this.path}_not_in`;
    if (not_in in args) {
      conditions.push({ $nin: args[not_in] });
    }
    return conditions;
  }
}

module.exports = {
  Select,
  MongoSelectInterface,
};
