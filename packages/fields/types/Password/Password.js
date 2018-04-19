const Field = require('../../Field');

module.exports = class Password extends Field {
  constructor(path, config) {
    super(path, config);
    this.graphQLType = 'String';
  }
  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    schema.add({
      [this.path]: { type: String, ...mongooseOptions },
    });
  }
  getGraphqlQueryArgs() {
    return `
      ${this.path}_is_set: Boolean
    `;
  }
  getQueryConditions(args) {
    const conditions = [];
    const is_set = `${this.path}_is_set`;
    if (is_set in args) {
      conditions.push(args[is_set] ? { $ne: null } : null);
    }
    return conditions;
  }
};
