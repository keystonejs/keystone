import { Keystone } from '@keystonejs/keystone';
import { MongooseAdapter } from '@keystonejs/adapter-mongoose';
import { KnexAdapter } from '@keystonejs/adapter-knex';
import type { KeystoneConfig, KeystoneSystem, BaseKeystone } from '@keystone-next/types';

import { applyIdFieldDefaults } from './applyIdFieldDefaults';
import { createAdminMeta } from './createAdminMeta';
import { createGraphQLSchema } from './createGraphQLSchema';
import { makeCreateContext } from './createContext';

import { implementSession } from '../session';

export function createKeystone(
  config: KeystoneConfig,
  createContextFactory: () => ReturnType<typeof makeCreateContext>
) {
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
  config = applyIdFieldDefaults(config);

  const keystone = createKeystone(config, () => createContext);

  const { adminMeta, views } = createAdminMeta(config, keystone);

  const graphQLSchema = createGraphQLSchema(config, keystone, adminMeta);

  const createContext = makeCreateContext({ keystone, graphQLSchema });

  let system = {
    keystone,
    adminMeta,
    graphQLSchema,
    views,
    sessionImplementation: config.session ? implementSession(config.session()) : undefined,
    createContext,
    config,
  };

  return system;
}
