const Implementation = require('../../Implementation');

module.exports = class Password extends Implementation {
  constructor() {
    super(...arguments);
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
  isGraphqlQueryArg(arg) {
    return arg === `${this.path}_is_set`;
  }
  getGraphqlUpdateArgs() {
    return `
      ${this.path}: String
    `;
  }
  getGraphqlCreateArgs() {
    return `
      ${this.path}: String
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
