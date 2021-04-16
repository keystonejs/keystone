import { GraphQLJSON } from 'graphql-type-json';
import { flatten, objMerge, unique } from '@keystone-next/utils-legacy';
import { BaseKeystoneList } from '@keystone-next/types';

export class ListCRUDProvider {
  lists: BaseKeystoneList[];
  constructor() {
    this.lists = [];
  }

  getTypes({ schemaName }: { schemaName: string }): string[] {
    return unique([
      ...flatten(this.lists.map(list => list.getGqlTypes({ schemaName }))),
      ...[
        `
          """
          NOTE: Can be JSON, or a Boolean/Int/String
          Why not a union? GraphQL doesn't support a union including a scalar
          (https://github.com/facebook/graphql/issues/215)
          """
          scalar JSON
        `,
        `
          type _QueryMeta {
            count: Int
          }
        `,
      ],
    ]);
  }

  getQueries({ schemaName }: { schemaName: string }): string[] {
    return flatten(this.lists.map(list => list.getGqlQueries({ schemaName })));
  }

  getMutations({ schemaName }: { schemaName: string }): string[] {
    return flatten(this.lists.map(list => list.getGqlMutations({ schemaName })));
  }

  getSubscriptions({}) {
    return [];
  }

  getTypeResolvers({ schemaName }: { schemaName: string }) {
    const queryMetaResolver = {
      // meta is passed in from the list's resolver (eg; '_allUsersMeta')
      count: (meta: { getCount: () => number }) => meta.getCount(),
    };

    return {
      ...objMerge(this.lists.map(list => list.gqlAuxFieldResolvers({ schemaName }))),
      ...objMerge(this.lists.map(list => list.gqlFieldResolvers({ schemaName }))),
      JSON: GraphQLJSON,
      _QueryMeta: queryMetaResolver,
    };
  }

  getQueryResolvers({ schemaName }: { schemaName: string }) {
    return {
      // Order is also important here, any TypeQuery's defined by types
      // shouldn't be able to override list-level queries
      ...objMerge(this.lists.map(list => list.gqlAuxQueryResolvers({ schemaName }))),
      ...objMerge(this.lists.map(list => list.gqlQueryResolvers({ schemaName }))),
    };
  }

  getMutationResolvers({ schemaName }: { schemaName: string }) {
    return objMerge(this.lists.map(list => list.gqlMutationResolvers({ schemaName })));
  }

  getSubscriptionResolvers({}: { schemaName: string }) {
    return {};
  }
}
