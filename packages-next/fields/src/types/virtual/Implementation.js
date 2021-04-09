import { PrismaFieldAdapter } from '@keystone-next/adapter-prisma-legacy';
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

  _modifyAccess(parsedAccess) {
    // The virtual field is not just a read-only field, it fundamentally doesn't
    // mean anything to do a create/update on this field. As such, we explicitly
    // set the access control to false for these operations.
    return Object.keys(parsedAccess).reduce((prev, schemaName) => {
      prev[schemaName] = { create: false, update: false, read: parsedAccess[schemaName].read };
      return prev;
    }, {});
  }

  getBackingTypes() {
    return {};
  }
}

export class PrismaVirtualInterface extends PrismaFieldAdapter {
  constructor() {
    super(...arguments);
    this.realKeys = [];
  }

  getPrismaSchema() {
    return [];
  }

  getQueryConditions() {
    return {};
  }
}
