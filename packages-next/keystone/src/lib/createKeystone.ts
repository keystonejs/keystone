import path from 'path';
// @ts-ignore
import { Keystone } from '@keystone-next/keystone-legacy';
// @ts-ignore
import { MongooseAdapter } from '@keystone-next/adapter-mongoose-legacy';
// @ts-ignore
import { KnexAdapter } from '@keystone-next/adapter-knex-legacy';
// @ts-ignore
import { PrismaAdapter } from '@keystone-next/adapter-prisma-legacy';
import type { KeystoneConfig, BaseKeystone, MigrationAction } from '@keystone-next/types';

export function createKeystone(
  config: KeystoneConfig,
  dotKeystonePath: string,
  migrationAction: MigrationAction,
  prismaClient?: any
) {
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
        migrationAction === 'dev' ? (db.useMigrations ? 'dev' : 'prototype') : migrationAction,
      prismaClient,
      ...db,
      provider: 'postgresql',
    });
  } else if (db.adapter === 'prisma_sqlite') {
    if (!config.experimental?.prismaSqlite) {
      throw new Error(
        'SQLite support is still experimental. You must set { experimental: { prismaSqlite: true } } in your config to use this feature.'
      );
    }
    adapter = new PrismaAdapter({
      getPrismaPath: () => path.join(dotKeystonePath, 'prisma'),
      prismaClient,
      migrationMode:
        migrationAction === 'dev' ? (db.useMigrations ? 'dev' : 'prototype') : migrationAction,
      ...db,
      provider: 'sqlite',
    });
  }
  // @ts-ignore The @types/keystonejs__keystone package has the wrong type for KeystoneOptions
  const keystone: BaseKeystone = new Keystone({
    adapter,
    queryLimits: graphql?.queryLimits,
    // @ts-ignore The @types/keystonejs__keystone package has the wrong type for KeystoneOptions
    onConnect: (keystone, { context } = {}) => config.db.onConnect?.(context),
    // FIXME: Unsupported options: Need to work which of these we want to support with backwards
    // compatibility options.
    // defaultAccess
  });

  Object.entries(lists).forEach(([key, { fields, graphql, access, hooks, description, db }]) => {
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
      adapterConfig: db,
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
      // cacheHint
      // plugins
    });
  });

  return keystone;
}
