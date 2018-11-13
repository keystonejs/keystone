const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');

class Text extends Implementation {
  constructor() {
    super(...arguments);
  }

  get gqlOutputFields() {
    return [`${this.path}: String`];
  }
  get gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  get gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('String'),
      ...this.stringInputFields('String'),
      ...this.equalityInputFieldsInsensitive('String'),
      ...this.stringInputFieldsInsensitive('String'),
      ...this.inInputFields('String'),
    ];
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: String`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: String`];
  }
}

class MongoTextInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions, unique } = this.config;
    const schemaOptions = { type: String, ...mongooseOptions };
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
      ...this.equalityConditions(),
      ...this.stringConditions(),
      ...this.equalityConditionsInsensitive(),
      ...this.stringConditionsInsensitive(),
      // These have no case-insensitive counter parts
      ...this.inConditions(),
    };
  }
}

module.exports = {
  Text,
  MongoTextInterface,
};
