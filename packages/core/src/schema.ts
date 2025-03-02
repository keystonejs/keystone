import type {
  BaseFields,
  BaseKeystoneTypeInfo,
  BaseListTypeInfo,
  IdFieldConfig,
  KeystoneConfigPre,
  KeystoneContext,
  ListConfig,
  KeystoneConfig,
} from './types'

import type { ListenOptions } from 'node:net'
import { idFieldType } from './lib/id-field'

function injectDefaults(config: KeystoneConfigPre, defaultIdField: IdFieldConfig) {
  // some error checking
  for (const [listKey, list] of Object.entries(config.lists)) {
    if (list.fields.id) {
      throw new Error(
        `"fields.id" is reserved by Keystone, use "db.idField" for the "${listKey}" list`
      )
    }

    if (list.isSingleton && list.db?.idField) {
      throw new Error(`"db.idField" on the "${listKey}" list conflicts with singleton defaults`)
    }
  }

  const updated: KeystoneConfig['lists'] = {}

  for (const [listKey, list] of Object.entries(config.lists)) {
    if (list.isSingleton) {
      updated[listKey] = {
        listKey,
        ...list,
        fields: {
          id: idFieldType({ kind: 'number', type: 'Int' }),
          ...list.fields,
        },
      }

      continue
    }

    updated[listKey] = {
      listKey,
      ...list,
      fields: {
        id: idFieldType(list.db?.idField ?? defaultIdField),
        ...list.fields,
      },
    }
  }

  return updated
}

function defaultIsAccessAllowed({ session, sessionStrategy }: KeystoneContext) {
  if (!sessionStrategy) return true
  return session !== undefined
}

async function noop() {}
function identity<T>(x: T) {
  return x
}

export function config<TypeInfo extends BaseKeystoneTypeInfo>(
  config: KeystoneConfigPre<TypeInfo>
): KeystoneConfig<TypeInfo> {
  if (!['postgresql', 'sqlite', 'mysql'].includes(config.db.provider)) {
    throw new TypeError(`"db.provider" only supports "sqlite", "postgresql" or "mysql"`)
  }

  // WARNING: Typescript should prevent this, but any string is useful for Prisma errors
  config.db.url ??= 'postgres://'

  const defaultIdField = config.db.idField ?? { kind: 'cuid' }
  const cors =
    config.server?.cors === true
      ? { origin: true, credentials: true }
      : config.server?.cors === false
        ? null
        : (config.server?.cors ?? null)

  const httpOptions: ListenOptions = { port: 3000 }
  if (config?.server && 'port' in config.server) {
    httpOptions.port = config.server.port
  }

  if (config?.server && 'options' in config.server && config.server.options) {
    Object.assign(httpOptions, config.server.options)
  }

  return {
    types: {
      ...config.types,
      path: config.types?.path ?? 'node_modules/.keystone/types.ts',
    },
    db: {
      ...config.db,
      shadowDatabaseUrl: config.db?.shadowDatabaseUrl ?? '',
      extendPrismaSchema: config.db?.extendPrismaSchema ?? identity,
      extendPrismaClient: config.db?.extendPrismaClient ?? identity,
      onConnect: config.db.onConnect ?? noop,
      prismaClientPath: config.db?.prismaClientPath ?? '@prisma/client',
      prismaSchemaPath: config.db?.prismaSchemaPath ?? 'schema.prisma',
      idField: config.db?.idField ?? defaultIdField,
      enableLogging:
        config.db.enableLogging === true
          ? ['query']
          : config.db.enableLogging === false
            ? []
            : (config.db.enableLogging ?? []),
    },
    graphql: {
      ...config.graphql,
      path: config.graphql?.path ?? '/api/graphql',
      playground: config.graphql?.playground ?? process.env.NODE_ENV !== 'production',
      schemaPath: config.graphql?.schemaPath ?? 'schema.graphql',
      extendGraphqlSchema: config.graphql?.extendGraphqlSchema ?? (s => s),
    },
    lists: injectDefaults(config, defaultIdField),
    server: {
      ...config.server,
      maxFileSize: config.server?.maxFileSize ?? 200 * 1024 * 1024, // 200 MiB
      extendExpressApp: config.server?.extendExpressApp ?? noop,
      extendHttpServer: config.server?.extendHttpServer ?? noop,
      cors,
      options: httpOptions,
    },
    session: config.session,
    storage: {
      ...config.storage,
    },
    telemetry: config.telemetry ?? true,
    ui: {
      ...config.ui,
      basePath: config.ui?.basePath ?? '',
      isAccessAllowed: config.ui?.isAccessAllowed ?? defaultIsAccessAllowed,
      isDisabled: config.ui?.isDisabled ?? false,
      getAdditionalFiles: config.ui?.getAdditionalFiles ?? [],
      pageMiddleware: config.ui?.pageMiddleware ?? noop,
      publicPages: config.ui?.publicPages ?? [],
      tsx: config.ui?.tsx ?? true,
    },
  }
}

let i = 0
export function group<ListTypeInfo extends BaseListTypeInfo>(config: {
  label: string
  description?: string
  fields: BaseFields<ListTypeInfo>
}) {
  const keys = Object.keys(config.fields)
  if (keys.some(key => key.startsWith('__group'))) {
    throw new Error('groups cannot be nested')
  }

  return {
    [`__group${i++}`]: {
      fields: keys,
      label: config.label,
      description: config.description ?? null,
    },
    ...config.fields,
  } as BaseFields<ListTypeInfo> // TODO: FIXME, see initialise-lists.ts:getListsWithInitialisedFields
}

export function list<ListTypeInfo extends BaseListTypeInfo>(config: ListConfig<ListTypeInfo>) {
  return { ...config }
}
