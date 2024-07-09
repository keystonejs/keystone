import { humanize } from '../../../lib/utils'
import {
  type BaseListTypeInfo,
  fieldType,
  type FieldTypeFunc,
  type CommonFieldConfig,
  orderDirectionEnum,
} from '../../../types'
import { graphql } from '../../..'
import {
  assertReadIsNonNullAllowed,
  getResolvedIsNullable,
  resolveHasValidation,
} from '../../non-null-graphql'
import { filters } from '../../filters'
import { mergeFieldHooks, type InternalFieldHooks } from '../../resolve-hooks'
import { type TimestampFieldMeta } from './views'

export type TimestampFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
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

export function timestamp <ListTypeInfo extends BaseListTypeInfo> (
  config: TimestampFieldConfig<ListTypeInfo> = {}
): FieldTypeFunc<ListTypeInfo> {
  const {
    isIndexed,
    defaultValue,
    validation,
  } = config

  return (meta) => {
    if (typeof defaultValue === 'string') {
      try {
        graphql.DateTime.graphQLType.parseValue(defaultValue)
      } catch (err) {
        throw new Error(
          `The timestamp field at ${meta.listKey}.${
            meta.fieldKey
          } specifies defaultValue: ${defaultValue} but values must be provided as a full ISO8601 date-time string such as ${new Date().toISOString()}`
        )
      }
    }

    const parsedDefaultValue =
      typeof defaultValue === 'string'
        ? (graphql.DateTime.graphQLType.parseValue(defaultValue) as Date)
        : defaultValue
    const resolvedIsNullable = getResolvedIsNullable(validation, config.db)

    assertReadIsNonNullAllowed(meta, config, resolvedIsNullable)
    const mode = resolvedIsNullable === false ? 'required' : 'optional'
    const fieldLabel = config.label ?? humanize(meta.fieldKey)
    const hasValidation = resolveHasValidation(config.db, validation)
    
    const hooks: InternalFieldHooks<ListTypeInfo> = {}
    if (hasValidation) {
      hooks.validate = ({ resolvedData, operation, addValidationError }) => {
        if (operation === 'delete') return

        const value = resolvedData[meta.fieldKey]
        if ((validation?.isRequired || resolvedIsNullable === false) && value === null) {
          addValidationError(`${fieldLabel} is required`)
        }
      }
    }

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
      hooks: mergeFieldHooks(hooks, config.hooks),
      input: {
        uniqueWhere: isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.DateTime }) } : undefined,
        where: {
          arg: graphql.arg({ type: filters[meta.provider].DateTime[mode] }),
          resolve: mode === 'optional' ? filters.resolveCommon : undefined,
        },
        create: {
          arg: graphql.arg({
            type: graphql.DateTime,
            // TODO: add support for defaultValue of { kind: 'now' } in the GraphQL API
            defaultValue: parsedDefaultValue instanceof Date ? parsedDefaultValue : undefined,
          }),
          resolve (val) {
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
        update: { arg: graphql.arg({ type: graphql.DateTime }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({ type: graphql.DateTime }),
      __ksTelemetryFieldTypeName: '@keystone-6/timestamp',
      views: '@keystone-6/core/fields/types/timestamp/views',
      getAdminMeta (): TimestampFieldMeta {
        return {
          defaultValue: defaultValue ?? null,
          isRequired: validation?.isRequired ?? false,
          updatedAt: config.db?.updatedAt ?? false,
        }
      },
    })
  }
}
