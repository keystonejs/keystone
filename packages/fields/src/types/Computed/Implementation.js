import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';
import { parseFieldAccess } from '@keystonejs/access-control';

export class Computed extends Implementation {
  constructor() {
    super(...arguments);
  }

  gqlOutputFields() {
    return [`${this.path}: ${this.config.graphQLReturnType || `String`}`];
  }
  getGqlAuxTypes() {
    return this.config.extendGraphQLTypes || [];
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: this.config.resolver };
  }
  gqlQueryInputFields() {
    return [
      ...this.equalityInputFields('String'),
      ...this.stringInputFields('String'),
      ...this.equalityInputFieldsInsensitive('String'),
      ...this.stringInputFieldsInsensitive('String'),
      ...this.inInputFields('String'),
    ];
  }
  extendAdminMeta(meta) {
    return { ...meta, graphQLSelection: this.config.graphQLReturnFragment || '', isReadOnly: true };
  }

  parseFieldAccess(args) {
    const parsedAccess = parseFieldAccess(args);
    const fieldDefaults = { create: false, update: false, delete: false };
    return Object.keys(parsedAccess).reduce((prev, schemaName) => {
      prev[schemaName] = { ...fieldDefaults, read: parsedAccess[schemaName].read };
      return prev;
    }, {});
  }
}

const CommonTextInterface = superclass =>
  class extends superclass {
    // Not sure what to do here?
    getQueryConditions(dbPath) {
      return {
        ...this.equalityConditions(dbPath),
        ...this.stringConditions(dbPath),
        ...this.equalityConditionsInsensitive(dbPath),
        ...this.stringConditionsInsensitive(dbPath),
        // These have no case-insensitive counter parts
        ...this.inConditions(dbPath),
      };
    }
  };

export class MongoComputedInterface extends CommonTextInterface(MongooseFieldAdapter) {
  addToMongooseSchema() {}
}

export class KnexComputedInterface extends CommonTextInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);
  }
  addToTableSchema() {}
}
