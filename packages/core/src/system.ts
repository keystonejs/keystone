import type express from 'express'
import next from 'next'
import {
  type KeystoneConfig,
  type KeystoneContext
} from './types'
import { createAdminUIMiddlewareWithNextApp } from './lib/server/createAdminUIMiddleware'
import { applyIdFieldDefaults } from './lib/config'

/** @deprecated */
export { createSystem } from './lib/createSystem'

/** @deprecated */
export { createExpressServer } from './lib/server/createExpressServer'

/** @deprecated, TODO: remove in breaking change */
export function initConfig (config: KeystoneConfig) {
  if (!['postgresql', 'sqlite', 'mysql'].includes(config.db.provider)) {
    throw new TypeError(
      'Invalid db configuration. Please specify db.provider as either "sqlite", "postgresql" or "mysql"'
    )
  }

  // WARNING: Typescript should prevent this, but any string is useful for Prisma errors
  config.db.url ??= 'postgres://'

  return {
    ...config,
    types: {
      path: 'node_modules/.keystone/types.ts',
      ...config.types,
    },
    db: {
      prismaSchemaPath: 'schema.prisma',
      ...config.db,
    },
    graphql: {
      schemaPath: 'schema.graphql',
      ...config.graphql,
    },
    lists: applyIdFieldDefaults(config),
    server: {
      cors: false,
      maxFileSize: 200 * 1024 * 1024, // 200 MiB

      extendExpressApp: async () => {},
      extendHttpServer: async () => {},
      ...config?.server,
    },
  }
}

/** @deprecated */
export async function createAdminUIMiddleware (
  config: KeystoneConfig,
  context: KeystoneContext,
  dev: boolean,
  projectAdminPath: string
  // TODO: return type required by pnpm
): Promise<(req: express.Request, res: express.Response) => void> {
  const nextApp = next({ dev, dir: projectAdminPath })
  await nextApp.prepare()
  return createAdminUIMiddlewareWithNextApp(config, context, nextApp)
}
