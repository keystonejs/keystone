import { MongooseFieldAdapter } from '@keystone-next/adapter-mongoose-legacy';
import { KnexFieldAdapter } from '@keystone-next/adapter-knex-legacy';
import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';
import { parseFieldAccess } from '@keystone-next/access-control-legacy';
import { Implementation } from '../../Implementation';

export class Virtual extends Implementation {
  constructor(
    path,
    {
      resolver,
      graphQLReturnType = 'String',
      graphQLReturnFragment = '',
      extendGraphQLTypes = [],
      args = [],
    }
  ) {
    super(...arguments);
    this.resolver = resolver;
    this.args = args;
    this.graphQLReturnType = graphQLReturnType;
    this.graphQLReturnFragment = graphQLReturnFragment;
    this.extendGraphQLTypes = extendGraphQLTypes;
  }

  get _supportsUnique() {
    return false;
  }

  gqlOutputFields() {
    const argString = this.args.length
      ? `(${this.args.map(({ name, type }) => `${name}: ${type}`).join('\n')})`
      : '';
    return [`${this.path}${argString}: ${this.graphQLReturnType}`];
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

  parseFieldAccess(args) {
    const parsedAccess = parseFieldAccess(args);
    const fieldDefaults = { create: false, update: false, delete: false };
    return Object.keys(parsedAccess).reduce((prev, schemaName) => {
      prev[schemaName] = { ...fieldDefaults, read: parsedAccess[schemaName].read };
      return prev;
    }, {});
  }

  getBackingTypes() {
    return {};
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

export class PrismaVirtualInterface extends CommonTextInterface(PrismaFieldAdapter) {
  constructor() {
    super(...arguments);
    this.realKeys = [];
  }
  getPrismaSchema() {
    return [];
  }
}
