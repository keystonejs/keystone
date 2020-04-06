import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';
import { parseFieldAccess } from '@keystonejs/access-control';

export class Virtual extends Implementation {
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
    return [];
  }
  extendAdminMeta(meta) {
    return {
      ...meta,
      isOrderable: false,
      graphQLSelection: this.config.graphQLReturnFragment || '',
      isReadOnly: true,
    };
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

const CommonVirtualInterface = superclass =>
  class extends superclass {
    getQueryConditions() {
      return {};
    }
  };

export class MongoVirtualInterface extends CommonVirtualInterface(MongooseFieldAdapter) {
  constructor() {
    super(...arguments);
    this.realKeys = [];
  }
  addToMongooseSchema() {}
}

export class KnexVirtualInterface extends CommonVirtualInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);
    this.realKeys = [];
  }
  addToTableSchema() {}
}

export class JSONVirtualInterface extends CommonVirtualInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);
    this.realKeys = [];
  }
  addToTableSchema() {}
}

export class MemoryVirtualInterface extends CommonVirtualInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);
    this.realKeys = [];
  }
  addToTableSchema() {}
}
