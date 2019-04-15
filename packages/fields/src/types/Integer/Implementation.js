import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystone-alpha/adapter-mongoose';
import { KnexFieldAdapter } from '@keystone-alpha/adapter-knex';

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

const CommonIntegerInterface = superclass =>
  class extends superclass {
    getQueryConditions(dbPath) {
      return {
        ...this.equalityConditions(dbPath),
        ...this.orderingConditions(dbPath),
        ...this.inConditions(dbPath),
      };
    }
  };

class MongoIntegerInterface extends CommonIntegerInterface(MongooseFieldAdapter) {
  addToMongooseSchema(schema) {
    const { mongooseOptions = {} } = this.config;
    const { isRequired } = mongooseOptions;

    const schemaOptions = {
      type: Number,
      validate: {
        validator: this.buildValidator(
          a => typeof a === 'number' && Number.isInteger(a),
          isRequired
        ),
        message: '{VALUE} is not an integer value',
      },
    };
    schema.add({ [this.path]: this.mergeSchemaOptions(schemaOptions, this.config) });
  }
}

class KnexIntegerInterface extends CommonIntegerInterface(KnexFieldAdapter) {
  createColumn(table) {
    return table.integer(this.path);
  }
}

module.exports = {
  Integer,
  MongoIntegerInterface,
  KnexIntegerInterface,
};
