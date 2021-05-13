import { FieldData, KeystoneConfig, DatabaseProvider, getGqlNames } from '@keystone-next/types';

import { createGraphQLSchema } from './createGraphQLSchema';
import { makeCreateContext } from './context/createContext';
import { initialiseLists } from './core/types-for-lists';
import { createAdminMeta } from './createAdminMeta';

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
  const { lists } = initialiseLists(transformedConfig.lists, provider);
  const adminMeta = createAdminMeta(transformedConfig, lists);
  return createGraphQLSchema(transformedConfig, lists, adminMeta);
}

export function createSystem(config: KeystoneConfig, PrismaClient?: any) {
  const provider = getDBProvider(config.db);
  const { lists } = initialiseLists(config.lists, provider);

  const adminMeta = createAdminMeta(config, lists);

  const graphQLSchema = createGraphQLSchema(config, lists, adminMeta);

  const internalGraphQLSchema = getInternalGraphQLSchema(config, provider);

  const prismaClient = PrismaClient
    ? new PrismaClient({ datasources: { [provider]: { url: config.db.url } } })
    : undefined;
  const createContext = makeCreateContext({
    graphQLSchema,
    internalSchema: internalGraphQLSchema,
    config,
    prismaClient,
    gqlNamesByList: Object.fromEntries(
      Object.entries(lists).map(([listKey, list]) => [listKey, getGqlNames({ listKey, ...list })])
    ),
  });

  return {
    keystone: {
      async connect() {
        await prismaClient.$connect();
        const context = createContext({ skipAccessControl: true, schemaName: 'internal' });
        await config.db.onConnect?.(context);
      },
      async disconnect() {
        await prismaClient.$disconnect();
      },
    },
    graphQLSchema,
    createContext,
    // TODO: REMOVE THIS
    // this should absolutely not under any circumstances be merged, this is much to make things easier right now to not change a bunch of other things
    lists,
  };
}
