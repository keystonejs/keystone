import { GraphQLSchema, GraphQLObjectType, execute, parse } from 'graphql';
import { mergeSchemas } from '@graphql-tools/merge';
import { mapSchema } from '@graphql-tools/utils';
import { Keystone } from '@keystonejs/keystone';
import { MongooseAdapter } from '@keystonejs/adapter-mongoose';
import { KnexAdapter } from '@keystonejs/adapter-knex';
import type {
  SerializedAdminMeta,
  KeystoneConfig,
  KeystoneSystem,
  SessionContext,
  FieldType,
  KeystoneGraphQLAPI,
  SessionStrategy,
} from '@keystone-next/types';
import { adminMetaSchemaExtension } from '@keystone-next/admin-ui/templates';
import { autoIncrement, mongoId } from '@keystone-next/fields';
import { gql } from '../schema';
import { itemAPIForList } from './itemAPI';
import { accessControlContext, skipAccessControlContext } from './createAccessControlContext';

/* Validate lists config and default the id field */
function applyIdFieldDefaults(config: KeystoneConfig): KeystoneConfig['lists'] {
  const { lists, db } = config;
  const newLists: KeystoneConfig['lists'] = {};
  Object.keys(lists).forEach(key => {
    const listConfig = lists[key];
    if (listConfig.fields.id) {
      throw new Error(
        `A field with the \`id\` path is defined in the fields object on the ${JSON.stringify(
          key
        )} list. This is not allowed, use the idField option instead.`
      );
    }
    let idField =
      listConfig.idField ?? { mongoose: mongoId({}), knex: autoIncrement({}) }[db.adapter];
    idField = {
      ...idField,
      config: {
        ui: {
          createView: { fieldMode: 'hidden', ...idField.config.ui?.createView },
          itemView: { fieldMode: 'hidden', ...idField.config.ui?.itemView },
          ...idField.config.ui,
        },
        ...idField.config,
      },
    };

    const fields = { id: idField, ...listConfig.fields };
    newLists[key] = { ...listConfig, fields };
  });
  return newLists;
}

export function createKeystone(
  config: KeystoneConfig,
  createContextFactory: () => ReturnType<typeof makeCreateContext>
): any {
  // Note: For backwards compatibility we may want to expose
  // this as a public API so that users can start their transition process
  // by using this pattern for creating their Keystone object before using
  // it in their existing custom servers or original CLI systems.
  const { db, graphql, lists } = config;
  // @ts-ignore The @types/keystonejs__keystone package has the wrong type for KeystoneOptions
  const keystone: BaseKeystone = new Keystone({
    adapter:
      // FIXME: prisma support
      db.adapter === 'knex'
        ? new KnexAdapter({
            knexOptions: { connection: db.url },
            // FIXME: Add support for all options
          })
        : new MongooseAdapter({
            mongoUri: db.url,
            //FIXME: Add support for all options
          }),
    cookieSecret: '123456789', // FIXME: Don't provide a default here. See #2882
    queryLimits: graphql?.queryLimits,
    // @ts-ignore The @types/keystonejs__keystone package has the wrong type for KeystoneOptions
    onConnect: () => {
      return config.db.onConnect?.(createContextFactory()({ skipAccessControl: true }));
    },
    // FIXME: Unsupported options: Need to work which of these we want to support with backwards
    // compatibility options.
    // defaultAccess
    // adapters
    // defaultAdapter
    // sessionStore
    // cookie
    // schemaNames
    // appVersion
  });

  Object.entries(lists).forEach(([key, { fields, graphql, access, hooks, description }]) => {
    keystone.createList(key, {
      fields: Object.fromEntries(
        Object.entries(fields).map(([key, { type, config }]: any) => [key, { type, ...config }])
      ),
      access,
      queryLimits: graphql?.queryLimits,
      schemaDoc: graphql?.description ?? description,
      listQueryName: graphql?.listQueryName,
      itemQueryName: graphql?.itemQueryName,
      hooks,
      // FIXME: Unsupported options: Need to work which of these we want to support with backwards
      // compatibility options.
      // adminDoc
      // labelResolver
      // labelField
      // adminConfig
      // label
      // singular
      // plural
      // path
      // adapterConfig
      // cacheHint
      // plugins
    });
  });

  return keystone;
}

export function createSystem(config: KeystoneConfig): KeystoneSystem {
  config.lists = applyIdFieldDefaults(config);

  const keystone = createKeystone(config, () => createContext);

  const sessionStrategy = config.session?.();

  const { adminMeta, views } = createAdminMeta(config, keystone, sessionStrategy);

  const graphQLSchema = createGraphQLSchema(config, keystone, sessionStrategy, adminMeta);

  const createContext = makeCreateContext({ keystone, graphQLSchema });

  return {
    keystone,
    sessionStrategy,
    adminMeta,
    views,
    graphQLSchema,
    createContext,
  };
}
