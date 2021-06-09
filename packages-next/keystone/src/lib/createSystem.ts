import { FieldData, KeystoneConfig, DatabaseProvider, getGqlNames } from '@keystone-next/types';

import { createAdminMeta } from '../admin-ui/system/createAdminMeta';
import { createGraphQLSchema } from './createGraphQLSchema';
import { makeCreateContext } from './context/createContext';
import { initialiseLists } from './core/types-for-lists';

export function getDBProvider(db: KeystoneConfig['db']): DatabaseProvider {
  if (db.adapter === 'prisma_postgresql' || db.provider === 'postgresql') {
    return 'postgresql';
  } else if (db.adapter === 'prisma_sqlite' || db.provider === 'sqlite') {
    return 'sqlite';
  } else {
    throw new Error(
      'Invalid db configuration. Please specify db.provider as either "sqlite" or "postgresql"'
    );
  }
}

function getInternalGraphQLSchema(config: KeystoneConfig, provider: DatabaseProvider) {
  const transformedConfig: KeystoneConfig = {
    ...config,
    lists: Object.fromEntries(
      Object.entries(config.lists).map(([listKey, list]) => {
        return [
          listKey,
          {
            ...list,
            access: true,
            fields: Object.fromEntries(
              Object.entries(list.fields).map(([fieldKey, field]) => {
                return [
                  fieldKey,
                  (data: FieldData) => {
                    return { ...field(data), access: true };
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
  const provider = getDBProvider(config.db);
  const lists = initialiseLists(config.lists, provider);

  const adminMeta = createAdminMeta(config, lists);

  const graphQLSchema = createGraphQLSchema(config, lists, adminMeta);

  const internalGraphQLSchema = getInternalGraphQLSchema(config, provider);

  return {
    graphQLSchema,
    adminMeta,
    getKeystone: (PrismaClient: any) => {
      const prismaClient = new PrismaClient({
        log: config.db.enableLogging && ['query'],
        datasources: { [provider]: { url: config.db.url } },
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
        internalSchema: internalGraphQLSchema,
        config,
        prismaClient,
        gqlNamesByList: Object.fromEntries(
          Object.entries(lists).map(([listKey, list]) => [listKey, getGqlNames(list)])
        ),
      });

      return {
        async connect() {
          await prismaClient.$connect();
          const context = createContext({ skipAccessControl: true, schemaName: 'internal' });
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
