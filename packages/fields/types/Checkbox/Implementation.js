const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');

class Checkbox extends Implementation {
  constructor() {
    super(...arguments);
  }

  getGraphqlOutputFields() {
    return [{ name: this.path, type: 'Boolean' }];
  }
  getGraphqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  getGraphqlQueryArgs() {
    return [{ name: this.path, type: 'Boolean' }, { name: `${this.path}_not`, type: 'Boolean' }];
  }
  getGraphqlUpdateArgs() {
    return [{ name: this.path, type: 'Boolean' }];
  }
  getGraphqlCreateArgs() {
    return [{ name: this.path, type: 'Boolean' }];
  }
}

class MongoCheckboxInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    schema.add({
      [this.path]: { type: Boolean, ...mongooseOptions },
    });
  }

  getQueryConditions() {
    return {
      [this.path]: value => ({ [this.path]: { $eq: value } }),
      [`${this.path}_not`]: value => ({ [this.path]: { $ne: value } }),
    };
  }
}

module.exports = {
  Checkbox,
  MongoCheckboxInterface,
};
