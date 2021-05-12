import { PrismaAdapter } from '@keystone-next/adapter-prisma-legacy';
import type { KeystoneConfig, BaseKeystone, DatabaseProvider } from '@keystone-next/types';
import { Keystone } from './core/Keystone/index';

export function createKeystone(
  config: KeystoneConfig,
  provider: DatabaseProvider,
  prismaClient?: any
) {
  // Note: For backwards compatibility we may want to expose
  // this as a public API so that users can start their transition process
  // by using this pattern for creating their Keystone object before using
  // it in their existing custom servers or original CLI systems.
  const { db, graphql, lists } = config;
  const adapter = new PrismaAdapter({ prismaClient, ...db, provider });
  // @ts-ignore The @types/keystonejs__keystone package has the wrong type for KeystoneOptions
  const keystone: BaseKeystone = new Keystone({
    adapter,
    queryLimits: graphql?.queryLimits,
    // We call context.sudo() here to regenerate the `context` object *after* the keystone.connect()
    // step. This ensures that context.prisma is correctly set up.
    // @ts-ignore The @types/keystonejs__keystone package has the wrong type for KeystoneOptions
    onConnect: (keystone, { context } = {}) => config.db.onConnect?.(context?.sudo()),
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
