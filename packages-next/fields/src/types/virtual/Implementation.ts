import { PrismaFieldAdapter, PrismaListAdapter } from '@keystone-next/adapter-prisma-legacy';
import { BaseKeystoneList, GraphQLResolver } from '@keystone-next/types';
import { FieldConfigArgs, FieldExtraArgs, Implementation } from '../../Implementation';

export class Virtual<P extends string> extends Implementation<P> {
  resolver: GraphQLResolver;
  args: { name: string; type: string }[];
  graphQLReturnType: string;
  graphQLReturnFragment: string;
  extendGraphQLTypes: string[];
  constructor(
    path: P,
    {
      resolver,
      graphQLReturnType = 'String',
      graphQLReturnFragment = '',
      extendGraphQLTypes = [],
      args = [],
      ...configArgs
    }: FieldConfigArgs & {
      resolver: GraphQLResolver;
      graphQLReturnType?: string;
      graphQLReturnFragment?: string;
      extendGraphQLTypes?: string[];
      args?: { name: string; type: string }[];
    },
    extraArgs: FieldExtraArgs
  ) {
    super(
      path,
      {
        resolver,
        graphQLReturnType,
        graphQLReturnFragment,
        extendGraphQLTypes,
        args,
        ...configArgs,
      },
      extraArgs
    );
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

  _modifyAccess(parsedAccess: any) {
    // The virtual field is not just a read-only field, it fundamentally doesn't
    // mean anything to do a create/update on this field. As such, we explicitly
    // set the access control to false for these operations.
    return Object.keys(parsedAccess).reduce((prev, schemaName) => {
      prev[schemaName] = { create: false, update: false, read: parsedAccess[schemaName].read };
      return prev;
    }, {} as Record<string, any>);
  }

  getBackingTypes() {
    return {};
  }
}

export class PrismaVirtualInterface<P extends string> extends PrismaFieldAdapter<P> {
  constructor(
    fieldName: string,
    path: P,
    field: Virtual<P>,
    listAdapter: PrismaListAdapter,
    getListByKey: (arg: string) => BaseKeystoneList | undefined,
    config = {}
  ) {
    super(fieldName, path, field, listAdapter, getListByKey, config);
  }

  getPrismaSchema() {
    return [];
  }

  getQueryConditions() {
    return {};
  }
}
