import path from 'path';
import { Keystone } from '@keystonejs/keystone';
import { MongooseAdapter } from '@keystonejs/adapter-mongoose';
import { KnexAdapter } from '@keystonejs/adapter-knex';
// @ts-ignore
import { PrismaAdapter } from '@keystonejs/adapter-prisma';
import type { KeystoneConfig, BaseKeystone } from '@keystone-next/types';

export function createKeystone(config: KeystoneConfig, dotKeystonePath: string, script: string) {
  // Note: For backwards compatibility we may want to expose
  // this as a public API so that users can start their transition process
  // by using this pattern for creating their Keystone object before using
  // it in their existing custom servers or original CLI systems.
  const { db, graphql, lists } = config;
  let adapter;
  if (db.adapter === 'knex') {
    adapter = new KnexAdapter({
      knexOptions: { connection: db.url },
      dropDatabase: db.dropDatabase,
    });
  } else if (db.adapter === 'mongoose') {
    adapter = new MongooseAdapter({ mongoUri: db.url, ...db.mongooseOptions });
  } else if (db.adapter === 'prisma_postgresql') {
    adapter = new PrismaAdapter({
      getPrismaPath: () => path.join(dotKeystonePath, 'prisma'),
      migrationMode:
        script === 'prototype'
          ? 'prototype'
          : script === 'generate'
          ? 'createOnly'
          : script === 'start'
          ? 'none'
          : 'dev',
      ...db,
    });
  }
  // @ts-ignore The @types/keystonejs__keystone package has the wrong type for KeystoneOptions
  const keystone: BaseKeystone = new Keystone({
    adapter,
    cookieSecret: '123456789', // FIXME: Don't provide a default here. See #2882
    queryLimits: graphql?.queryLimits,
    // @ts-ignore The @types/keystonejs__keystone package has the wrong type for KeystoneOptions
    onConnect: (keystone, { context } = {}) => config.db.onConnect?.(context),
    // FIXME: Unsupported options: Need to work which of these we want to support with backwards
    // compatibility options.
    // defaultAccess
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
