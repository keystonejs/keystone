const { Implementation } = require('../../Implementation');
const { MongooseFieldAdapter } = require('@voussoir/adapter-mongoose');

class Integer extends Implementation {
  constructor() {
    super(...arguments);
  }

  get gqlOutputFields() {
    return [`${this.path}: Int`];
  }
  get gqlOutputFieldResolvers() {
    return { [`${this.path}`]: item => item[this.path] };
  }

  get gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('Int'),
      ...this.orderingInputFields('Int'),
      ...this.inInputFields('Int'),
    ];
  }
  get gqlUpdateInputFields() {
    return [`${this.path}: Int`];
  }
  get gqlCreateInputFields() {
    return [`${this.path}: Int`];
  }
}

class MongoIntegerInterface extends MongooseFieldAdapter {
  addToMongooseSchema(schema) {
    const { mongooseOptions, unique } = this.config;
    const required = mongooseOptions && mongooseOptions.required;

    const schemaOptions = {
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
    };

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
      ...this.orderingConditions(),
      ...this.inConditions(),
    };
  }
}

module.exports = {
  Integer,
  MongoIntegerInterface,
};
