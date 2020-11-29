import { execute, GraphQLSchema, parse } from 'graphql';
import type {
  CreateKeystoneContextArgs,
  KeystoneContext,
  KeystoneGraphQLAPI,
} from '@keystone-next/types';

import { itemAPIConstructorForList } from './itemAPI';
import { accessControlContext, skipAccessControlContext } from './createAccessControlContext';

export function makeCreateContext({
  adminMeta,
  graphQLSchema,
  keystone,
}: {
  adminMeta: any;
  graphQLSchema: GraphQLSchema;
  keystone: any;
}) {
  const listKeys = Object.keys(adminMeta.lists);
  const itemAPIConstructor: Record<string, ReturnType<typeof itemAPIConstructorForList>> = {};

  for (const listKey of listKeys) {
    itemAPIConstructor[listKey] = itemAPIConstructorForList(keystone.lists[listKey], graphQLSchema);
  }

  const createContext = ({
    sessionContext,
    skipAccessControl = false,
  }: CreateKeystoneContextArgs): KeystoneContext => {
    const rawGraphQL: KeystoneGraphQLAPI<any>['raw'] = ({ query, variables }) => {
      if (typeof query === 'string') {
        query = parse(query);
      }
      return Promise.resolve(
        execute({
          contextValue: context,
          document: query,
          schema: graphQLSchema,
          variableValues: variables,
        })
      );
    };
    const runGraphQL: KeystoneGraphQLAPI<any>['run'] = async args => {
      let result = await rawGraphQL(args);
      if (result.errors?.length) {
        throw result.errors[0];
      }
      return result.data as Record<string, any>;
    };
    const itemAPI: Record<string, any> = {}; // TODO
    const context: any = {
      schemaName: 'public',
      lists: itemAPI,
      totalResults: 0,
      keystone,
      graphql: {
        createContext,
        raw: rawGraphQL,
        run: runGraphQL,
        schema: graphQLSchema,
      },
      maxTotalResults: (keystone as any).queryLimits.maxTotalResults,
      createContext,
      cloneContext: ({ skipAccessControl }: { skipAccessControl: boolean }) =>
        createContext({ skipAccessControl, sessionContext }),
      ...(skipAccessControl ? skipAccessControlContext : accessControlContext),
      ...sessionContext,
      // Note: These two fields let us use the server-side-graphql-client library.
      // We should remove them once the updated itemAPI w/ resolveFields is available.
      // (They are marked as deprecated in the types)
      executeGraphQL: rawGraphQL,
      gqlNames: (listKey: string) => keystone.lists[listKey].gqlNames,
    };
    for (const listKey of listKeys) {
      itemAPI[listKey] = itemAPIConstructor[listKey](context);
    }

    return context;
  };

  return createContext;
}
