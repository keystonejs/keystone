const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');

class Float extends Implementation {
  constructor() {
    super(...arguments);
  }

  getGraphqlOutputFields() {
    return [{ name: this.path, type: `Float` }];
  }
  getGraphqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  getGraphqlQueryArgs() {
    return [
      { name: this.path, type: `Float` },
      { name: `${this.path}_not`, type: `Float` },
      { name: `${this.path}_lt`, type: `Float` },
      { name: `${this.path}_lte`, type: `Float` },
      { name: `${this.path}_gt`, type: `Float` },
      { name: `${this.path}_gte`, type: `Float` },
      { name: `${this.path}_in`, type: `[Float]` },
      { name: `${this.path}_not_in`, type: `[Float]` },
    ];
  }
  getGraphqlUpdateArgs() {
    return [{ name: this.path, type: `Float` }];
  }
  getGraphqlCreateArgs() {
    return [{ name: this.path, type: `Float` }];
  }
}

class MongoFloatInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    schema.add({
      [this.path]: { type: Number, ...mongooseOptions },
    });
  }

  getQueryConditions() {
    return {
      [this.path]: value => ({ [this.path]: { $eq: value } }),
      [`${this.path}_not`]: value => ({ [this.path]: { $ne: value } }),
      [`${this.path}_lt`]: value => ({ [this.path]: { $lt: value } }),
      [`${this.path}_lte`]: value => ({ [this.path]: { $lte: value } }),
      [`${this.path}_gt`]: value => ({ [this.path]: { $gt: value } }),
      [`${this.path}_gte`]: value => ({ [this.path]: { $gte: value } }),
      [`${this.path}_in`]: value => ({ [this.path]: { $in: value } }),
      [`${this.path}_not_in`]: value => ({ [this.path]: { $not: { $in: value } } }),
    };
  }
}

module.exports = {
  Float,
  MongoFloatInterface,
};
