import { Implementation } from '../../Implementation';
import { MongooseFieldAdapter } from '@keystonejs/adapter-mongoose';
import { KnexFieldAdapter } from '@keystonejs/adapter-knex';
import { parseFieldAccess } from '@keystonejs/access-control';

export class Virtual extends Implementation {
  constructor(
    path,
    { resolver, graphQLReturnType = 'String', graphQLReturnFragment = '', extendGraphQLTypes = [] }
  ) {
    super(...arguments);
    this.resolver = resolver;
    this.graphQLReturnType = graphQLReturnType;
    this.graphQLReturnFragment = graphQLReturnFragment;
    this.extendGraphQLTypes = extendGraphQLTypes;
  }

  gqlOutputFields() {
    return [`${this.path}: ${this.graphQLReturnType}`];
  }
  getGqlAuxTypes() {
    return this.extendGraphQLTypes;
  }
  gqlOutputFieldResolvers() {
    return { [`${this.path}`]: this.resolver };
  }
  gqlQueryInputFields() {
    return [];
  }
  extendAdminMeta(meta) {
    return {
      ...meta,
      graphQLSelection: this.graphQLReturnFragment,
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

const CommonTextInterface = superclass =>
  class extends superclass {
    getQueryConditions() {
      return {};
    }
  };

export class MongoVirtualInterface extends CommonTextInterface(MongooseFieldAdapter) {
  constructor() {
    super(...arguments);
    this.realKeys = [];
  }
  addToMongooseSchema() {}
}

export class KnexVirtualInterface extends CommonTextInterface(KnexFieldAdapter) {
  constructor() {
    super(...arguments);
    this.realKeys = [];
  }
  addToTableSchema() {}
}
