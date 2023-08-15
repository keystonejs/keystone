import { randomBytes } from 'node:crypto';
import pLimit from 'p-limit';
import type { FieldData, KeystoneConfig } from '../types';

import type { PrismaModule } from '../artifacts';
import { allowAll } from '../access';
import { createAdminMeta } from './create-admin-meta';
import { createGraphQLSchema } from './createGraphQLSchema';
import { createContext } from './context/createContext';
import { initialiseLists, InitialisedList } from './core/initialise-lists';
import { setPrismaNamespace, setWriteLimit } from './core/utils';

function getSudoGraphQLSchema(config: KeystoneConfig) {
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
    ui: {
      ...config.ui,
      isAccessAllowed: allowAll,
    },
    lists: Object.fromEntries(
      Object.entries(config.lists).map(([listKey, list]) => {
        return [
          listKey,
          {
            ...list,
            access: allowAll,
            graphql: { ...(list.graphql || {}), omit: {} },
            fields: Object.fromEntries(
              Object.entries(list.fields).map(([fieldKey, field]) => {
                if (fieldKey.startsWith('__group')) return [fieldKey, field];
                return [
                  fieldKey,
                  (data: FieldData) => {
                    const f = field(data);
                    return {
                      ...f,
                      access: allowAll,
                      isFilterable: true,
                      isOrderable: true,
                      graphql: { ...(f.graphql || {}), omit: {} },
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

  const lists = initialiseLists(transformedConfig);
  const adminMeta = createAdminMeta(transformedConfig, lists);
  return createGraphQLSchema(transformedConfig, lists, adminMeta, true);
  // TODO: adminMeta not useful for sudo, remove in breaking change
  // return createGraphQLSchema(transformedConfig, lists, null, true);
}

function injectNewDefaults(prismaClient: any, lists: Record<string, InitialisedList>) {
  for (const listKey in lists) {
    const list = lists[listKey];

    // TODO: other fields might use 'random' too
    const { dbField } = list.fields.id;

    if ('default' in dbField && dbField.default?.kind === 'random') {
      const { bytes, encoding } = dbField.default;
      prismaClient = prismaClient.$extends({
        query: {
          [list.prisma.listKey]: {
            async create({ model, args, query }: any) {
              return query({
                ...args,
                data: {
                  ...args.data,
                  id: args.data.id ?? randomBytes(bytes).toString(encoding),
                },
              });
            },
          },
        },
      });
    }
  }

  return prismaClient;
}

export function createSystem(config: KeystoneConfig) {
  const lists = initialiseLists(config);
  const adminMeta = createAdminMeta(config, lists);
  const graphQLSchema = createGraphQLSchema(config, lists, adminMeta, false);
  const graphQLSchemaSudo = getSudoGraphQLSchema(config);

  return {
    graphQLSchema,
    adminMeta,
    getKeystone: (prismaModule: PrismaModule) => {
      const prePrismaClient = new prismaModule.PrismaClient({
        datasources: { [config.db.provider]: { url: config.db.url } },
        log:
          config.db.enableLogging === true
            ? ['query']
            : config.db.enableLogging === false
            ? undefined
            : config.db.enableLogging,
      });

      const prismaClient = injectNewDefaults(prePrismaClient, lists);
      setWriteLimit(prismaClient, pLimit(config.db.provider === 'sqlite' ? 1 : Infinity));
      setPrismaNamespace(prismaClient, prismaModule.Prisma);

      const context = createContext({
        graphQLSchema,
        graphQLSchemaSudo,
        config,
        prismaClient,
        lists,
      });

      return {
        // TODO: replace with server.onStart, remove in breaking change
        async connect() {
          await prismaClient.$connect();
          await config.db.onConnect?.(context);
        },
        // TODO: only used by tests, remove in breaking change
        async disconnect() {
          await prismaClient.$disconnect();
        },
        context,
      };
    },
  };
}
