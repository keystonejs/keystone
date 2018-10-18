const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');

class Float extends Implementation {
  constructor() {
    super(...arguments);
  }

  get gqlOutputFields() {
    return [`${this.path}: Float`];
  }
  get gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  get gqlQueryInputFields() {
    return [
      `${this.path}: Float`,
      `${this.path}_not: Float`,
      `${this.path}_lt: Float`,
      `${this.path}_lte: Float`,
      `${this.path}_gt: Float`,
      `${this.path}_gte: Float`,
      `${this.path}_in: [Float]`,
      `${this.path}_not_in: [Float]`,
    ];
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: Float`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: Float`];
  }
}

class MongoFloatInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions, unique } = this.config;
    const schemaOptions = { type: Number, ...mongooseOptions };
    if (unique) {
      // A value of anything other than `true` causes errors with Mongoose
      // constantly recreating indexes. Ie; if we just splat `unique` onto the
      // options object, it would be `undefined`, which would cause Mongoose to
      // drop and recreate all indexes.
      schemaOptions.unique = true;
    }
    schema.add({ [this.path]: schemaOptions });
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
