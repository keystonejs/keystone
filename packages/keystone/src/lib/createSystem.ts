import { FieldData, KeystoneConfig, DatabaseProvider, getGqlNames } from '../types';

import { createAdminMeta } from '../admin-ui/system/createAdminMeta';
import { createGraphQLSchema } from './createGraphQLSchema';
import { makeCreateContext } from './context/createContext';
import { initialiseLists } from './core/types-for-lists';

function getSudoGraphQLSchema(config: KeystoneConfig, provider: DatabaseProvider) {
  // This function creates a GraphQLSchema based on a modified version of the provided config.
  // The modifications are:
  //  * All list level access control is disabled
  //  * All field level access control is disabled
  //  * All graphql.omit configuration is disabled
  //  * All fields are explicitly made filterable and orderable
  //
  // These changes result in a schema without any restrictions on the CRUD
  // operations that can be run.
  //
  // The resulting schema is used as the GraphQL schema when calling `context.sudo()`.
  const transformedConfig: KeystoneConfig = {
    ...config,
    lists: Object.fromEntries(
      Object.entries(config.lists).map(([listKey, list]) => {
        return [
          listKey,
          {
            ...list,
            access: { operation: {}, item: {}, filter: {} },
            graphql: { ...(list.graphql || {}), omit: [] },
            fields: Object.fromEntries(
              Object.entries(list.fields).map(([fieldKey, field]) => {
                return [
                  fieldKey,
                  (data: FieldData) => {
                    const f = field(data);
                    return {
                      ...f,
                      access: () => true,
                      isFilterable: true,
                      isOrderable: true,
                      graphql: { ...(f.graphql || {}), omit: [] },
                    };
                  },
                ];
              })
            ),
          },
        ];
      })
    ),
  };
  const lists = initialiseLists(transformedConfig.lists, provider);
  const adminMeta = createAdminMeta(transformedConfig, lists);
  return createGraphQLSchema(transformedConfig, lists, adminMeta);
}

export function createSystem(config: KeystoneConfig) {
  const lists = initialiseLists(config.lists, config.db.provider);

  const adminMeta = createAdminMeta(config, lists);

  const graphQLSchema = createGraphQLSchema(config, lists, adminMeta);

  const sudoGraphQLSchema = getSudoGraphQLSchema(config, config.db.provider);

  return {
    graphQLSchema,
    adminMeta,
    getKeystone: (PrismaClient: any) => {
      const prismaClient = new PrismaClient({
        log: config.db.enableLogging && ['query'],
        datasources: { [config.db.provider]: { url: config.db.url } },
      });
      prismaClient.$on('beforeExit', async () => {
        // Prisma is failing to properly clean up its child processes
        // https://github.com/keystonejs/keystone/issues/5477
        // We explicitly send a SIGINT signal to the prisma child process on exit
        // to ensure that the process is cleaned up appropriately.
        prismaClient._engine.child.kill('SIGINT');
      });

      const createContext = makeCreateContext({
        graphQLSchema,
        sudoGraphQLSchema,
        config,
        prismaClient,
        gqlNamesByList: Object.fromEntries(
          Object.entries(lists).map(([listKey, list]) => [listKey, getGqlNames(list)])
        ),
        lists,
      });

      return {
        async connect() {
          await prismaClient.$connect();
          const context = createContext({ sudo: true });
          await config.db.onConnect?.(context);
        },
        async disconnect() {
          await prismaClient.$disconnect();
        },
        createContext,
      };
    },
  };
}
