import type { SimpleFieldTypeInfo } from '../../../types'
import {
  type BaseListTypeInfo,
  type FieldTypeFunc,
  type CommonFieldConfig,
  fieldType,
  orderDirectionEnum,
} from '../../../types'
import { g } from '../../..'
import { filters } from '../../filters'
import { makeValidateHook, defaultIsRequired } from '../../non-null-graphql'
import { type TimestampFieldMeta } from './views'

export type TimestampFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<
  ListTypeInfo,
  SimpleFieldTypeInfo<'DateTime' | 'String'> // TODO: make more exact
> & {
  isIndexed?: boolean | 'unique'
  validation?: {
    isRequired?: boolean
  }
  defaultValue?: string | { kind: 'now' }
  db?: {
    // this is @updatedAt in Prisma
    updatedAt?: boolean
    isNullable?: boolean
    map?: string
    extendPrismaSchema?: (field: string) => string
  }
}

export function timestamp<ListTypeInfo extends BaseListTypeInfo>(
  config: TimestampFieldConfig<ListTypeInfo> = {}
): FieldTypeFunc<ListTypeInfo> {
  const { isIndexed, defaultValue, validation } = config

  return meta => {
    if (typeof defaultValue === 'string') {
      try {
        g.DateTime.parseValue(defaultValue)
      } catch (err) {
        throw new Error(
          `${meta.listKey}.${meta.fieldKey}.defaultValue is required to be an ISO8601 date-time string such as ${new Date().toISOString()}`
        )
      }
    }

    const parsedDefaultValue =
      typeof defaultValue === 'string'
        ? (g.DateTime.parseValue(defaultValue) as Date)
        : defaultValue
    const { mode, validate } = makeValidateHook(meta, config)

    return fieldType({
      kind: 'scalar',
      mode,
      scalar: 'DateTime',
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      default:
        typeof defaultValue === 'string'
          ? {
              kind: 'literal',
              value: defaultValue,
            }
          : defaultValue === undefined
            ? undefined
            : { kind: 'now' },
      updatedAt: config.db?.updatedAt,
      map: config.db?.map,
      extendPrismaSchema: config.db?.extendPrismaSchema,
    })({
      ...config,
      ...defaultIsRequired(config, validation?.isRequired ?? false),
      hooks: {
        ...config.hooks,
        validate,
      },
      input: {
        uniqueWhere: isIndexed === 'unique' ? { arg: g.arg({ type: g.DateTime }) } : undefined,
        where: {
          arg: g.arg({ type: filters[meta.provider].DateTime[mode] }),
          resolve: mode === 'optional' ? filters.resolveCommon : undefined,
        },
        create: {
          arg: g.arg({
            type: g.DateTime,
            // TODO: add support for defaultValue of { kind: 'now' } in the GraphQL API
            defaultValue: parsedDefaultValue instanceof Date ? parsedDefaultValue : undefined,
          }),
          resolve(val) {
            if (val === undefined) {
              if (parsedDefaultValue === undefined && config.db?.updatedAt) return undefined
              if (parsedDefaultValue instanceof Date || parsedDefaultValue === undefined) {
                return parsedDefaultValue ?? null
              }

              return new Date()
            }
            return val
          },
        },
        update: { arg: g.arg({ type: g.DateTime }) },
        orderBy: { arg: g.arg({ type: orderDirectionEnum }) },
      },
      output: g.field({ type: g.DateTime }),
      __ksTelemetryFieldTypeName: '@keystone-6/timestamp',
      views: '@keystone-6/core/fields/types/timestamp/views',
      getAdminMeta(): TimestampFieldMeta {
        return {
          defaultValue: defaultValue ?? null,
          updatedAt: config.db?.updatedAt ?? false,
        }
      },
    })
  }
}
