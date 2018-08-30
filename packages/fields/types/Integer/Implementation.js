const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@keystonejs/adapter-mongoose');

class Integer extends Implementation {
  constructor() {
    super(...arguments);
  }

  getGraphqlOutputFields() {
    return [{ name: this.path, type: `Int` }];
  }
  getGraphqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  getGraphqlQueryArgs() {
    return [
      { name: this.path, type: `Int` },
      { name: `${this.path}_not`, type: `Int` },
      { name: `${this.path}_lt`, type: `Int` },
      { name: `${this.path}_lte`, type: `Int` },
      { name: `${this.path}_gt`, type: `Int` },
      { name: `${this.path}_gte`, type: `Int` },
      { name: `${this.path}_in`, type: `[Int]` },
      { name: `${this.path}_not_in`, type: `[Int]` },
    ];
  }
  getGraphqlUpdateArgs() {
    return [{ name: this.path, type: `Int` }];
  }
  getGraphqlCreateArgs() {
    return [{ name: this.path, type: `Int` }];
  }
}

class MongoIntegerInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions } = this.config;
    const required = mongooseOptions && mongooseOptions.required;

    schema.add({
      [this.path]: {
        type: Number,
        validate: {
          validator: required
            ? Number.isInteger
            : a => {
                if (typeof a === 'number' && Number.isInteger(a)) return true;
                if (typeof a === 'undefined' || a === null) return true;
                return false;
              },
          message: '{VALUE} is not an integer value',
        },
        ...mongooseOptions,
      },
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
  Integer,
  MongoIntegerInterface,
};
