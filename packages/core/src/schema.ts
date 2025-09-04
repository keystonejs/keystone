import type { ListenOptions } from 'node:net'

import { idFieldType } from './lib/id-field'
import type {
  BaseFields,
  BaseKeystoneTypeInfo,
  BaseListTypeInfo,
  IdFieldConfig,
  KeystoneConfig,
  KeystoneConfigPre,
  KeystoneContext,
  ListConfig,
  MaybeItemFunctionWithFilter,
  MaybeSessionFunction,
  MaybeSessionFunctionWithFilter,
} from './types'

function listsWithDefaults(config: KeystoneConfigPre, defaultIdField: IdFieldConfig) {
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

  return Object.fromEntries([
    ...(function* () {
      for (const [listKey, list] of Object.entries(config.lists)) {
        yield [
          listKey,
          {
            listKey,
            defaultIsFilterable: true, // TODO: move to access control?
            defaultIsOrderable: true, // TODO: move to access control?
            isSingleton: false,
            ...list,
            db: {
              ...list.db,
            },
            fields: {
              ...(list.isSingleton
                ? {
                    id: idFieldType({ kind: 'number', type: 'Int' }),
                    ...list.fields,
                  }
                : {
                    id: idFieldType(list.db?.idField ?? defaultIdField),
                    ...list.fields,
                  }),
            },
            actions: {
              ...list.actions,
            },
            hooks: {
              ...list.hooks,
            },
            graphql: {
              ...list.graphql,
            },
            ui: {
              ...list.ui,
            },
          } satisfies KeystoneConfig['lists'][string],
        ]
      }
    })(),
  ]) satisfies KeystoneConfig['lists']
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
    lists: listsWithDefaults(config, defaultIdField),
    server: {
      ...config.server,
      maxFileSize: config.server?.maxFileSize ?? 200 * 1024 * 1024, // 200 MiB
      extendExpressApp: config.server?.extendExpressApp ?? noop,
      extendHttpServer: config.server?.extendHttpServer ?? noop,
      cors,
      options: httpOptions,
    },
    session: config.session,
    telemetry: config.telemetry ?? true,
    ui: {
      ...config.ui,
      basePath: config.ui?.basePath ?? '',
      isAccessAllowed: config.ui?.isAccessAllowed ?? defaultIsAccessAllowed,
      isDisabled: config.ui?.isDisabled ?? false,
      getAdditionalFiles: config.ui?.getAdditionalFiles ?? (() => []),
      pageMiddleware: config.ui?.pageMiddleware ?? noop,
      publicPages: config.ui?.publicPages ?? [],
      tsx: config.ui?.tsx ?? true,
    },
  }
}

let i = 0

export type GroupInfo<ListTypeInfo extends BaseListTypeInfo> = {
  fields: string[]
  label: string
  description: string
  ui: GroupUIConfig<ListTypeInfo> | undefined
}

type GroupUIConfig<ListTypeInfo extends BaseListTypeInfo> = {
  createView?: {
    defaultFieldMode?: MaybeSessionFunctionWithFilter<'edit' | 'hidden', ListTypeInfo>
  }
  itemView?: {
    defaultFieldMode?: MaybeItemFunctionWithFilter<'edit' | 'read' | 'hidden', ListTypeInfo>
  }
  listView?: {
    defaultFieldMode?: MaybeSessionFunction<'read' | 'hidden', ListTypeInfo>
  }
}

export function group<ListTypeInfo extends BaseListTypeInfo>(config: {
  label: string
  description?: string
  ui?: GroupUIConfig<ListTypeInfo>
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
      description: config.description ?? '',
      ui: config.ui,
    } satisfies GroupInfo<ListTypeInfo>,
    ...config.fields,
  } as BaseFields<ListTypeInfo> // TODO: FIXME, see initialise-lists.ts:getListsWithInitialisedFields
}

export function list<ListTypeInfo extends BaseListTypeInfo>(listConfig: ListConfig<ListTypeInfo>) {
  return { ...listConfig }
}
