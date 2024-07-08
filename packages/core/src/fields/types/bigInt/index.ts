import { humanize } from '../../../lib/utils'
import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  fieldType,
  orderDirectionEnum,
} from '../../../types'
import { graphql } from '../../..'
import {
  assertReadIsNonNullAllowed,
  getResolvedIsNullable,
  resolveHasValidation,
} from '../../non-null-graphql'
import { filters } from '../../filters'
import {
  type InternalFieldHooks,
  mergeFieldHooks,
} from '../../resolve-hooks'

export type BigIntFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    isIndexed?: boolean | 'unique'
    defaultValue?: bigint | { kind: 'autoincrement' }
    validation?: {
      isRequired?: boolean
      min?: bigint
      max?: bigint
    }
    db?: {
      isNullable?: boolean
      map?: string
      extendPrismaSchema?: (field: string) => string
    }
  }

// These are the max and min values available to a 64 bit signed integer
const MAX_INT = 9223372036854775807n
const MIN_INT = -9223372036854775808n

export function bigInt <ListTypeInfo extends BaseListTypeInfo> (
  config: BigIntFieldConfig<ListTypeInfo> = {}
): FieldTypeFunc<ListTypeInfo> {
  const {
    isIndexed,
    defaultValue: _defaultValue,
    validation: _validation,
  } = config

  return (meta) => {
    const defaultValue = _defaultValue ?? null
    const hasAutoIncDefault =
      typeof defaultValue == 'object' &&
      defaultValue !== null &&
      defaultValue.kind === 'autoincrement'

    const isNullable = getResolvedIsNullable(_validation, config.db)

    if (hasAutoIncDefault) {
      if (meta.provider === 'sqlite' || meta.provider === 'mysql') {
        throw new Error(`The bigInt field at ${meta.listKey}.${meta.fieldKey} specifies defaultValue: { kind: 'autoincrement' }, this is not supported on ${meta.provider}`)
      }
      if (isNullable !== false) {
        throw new Error(
          `The bigInt field at ${meta.listKey}.${meta.fieldKey} specifies defaultValue: { kind: 'autoincrement' } but doesn't specify db.isNullable: false.\n` +
            `Having nullable autoincrements on Prisma currently incorrectly creates a non-nullable column so it is not allowed.\n` +
            `https://github.com/prisma/prisma/issues/8663`
        )
      }
    }

    const validation = {
      isRequired: _validation?.isRequired ?? false,
      min: _validation?.min ?? MIN_INT,
      max: _validation?.max ?? MAX_INT,
    }

    for (const type of ['min', 'max'] as const) {
      if (validation[type] > MAX_INT || validation[type] < MIN_INT) {
        throw new Error(`The bigInt field at ${meta.listKey}.${meta.fieldKey} specifies validation.${type}: ${validation[type]} which is outside of the range of a 64bit signed integer(${MIN_INT}n - ${MAX_INT}n) which is not allowed`)
      }
    }
    if (validation.min > validation.max) {
      throw new Error(`The bigInt field at ${meta.listKey}.${meta.fieldKey} specifies a validation.max that is less than the validation.min, and therefore has no valid options`)
    }

    assertReadIsNonNullAllowed(meta, config, isNullable)

    const mode = isNullable === false ? 'required' : 'optional'
    const fieldLabel = config.label ?? humanize(meta.fieldKey)
    const hasValidation = resolveHasValidation(config.db, validation)

    const hooks: InternalFieldHooks<ListTypeInfo> = {}
    if (hasValidation) {
      hooks.validate = ({ resolvedData, operation, addValidationError }) => {
        if (operation === 'delete') return

        const value = resolvedData[meta.fieldKey]

        if (
          (validation?.isRequired || isNullable === false) &&
          (value === null ||
            (operation === 'create' && value === undefined && !hasAutoIncDefault))
        ) {
          addValidationError(`${fieldLabel} is required`)
        }
        if (typeof value === 'number') {
          if (validation?.min !== undefined && value < validation.min) {
            addValidationError(
              `${fieldLabel} must be greater than or equal to ${validation.min}`
            )
          }

          if (validation?.max !== undefined && value > validation.max) {
            addValidationError(
              `${fieldLabel} must be less than or equal to ${validation.max}`
            )
          }
        }
      }
    }

    return fieldType({
      kind: 'scalar',
      mode,
      scalar: 'BigInt',
      // This will resolve to 'index' if the boolean is true, otherwise other values - false will be converted to undefined
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      default:
        typeof defaultValue === 'bigint'
          ? { kind: 'literal', value: defaultValue }
          : defaultValue?.kind === 'autoincrement'
          ? { kind: 'autoincrement' }
          : undefined,
      map: config.db?.map,
      extendPrismaSchema: config.db?.extendPrismaSchema,
    })({
      ...config,
      hooks: mergeFieldHooks(hooks, config.hooks),
      input: {
        uniqueWhere:
          isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.BigInt }) } : undefined,
        where: {
          arg: graphql.arg({ type: filters[meta.provider].BigInt[mode] }),
          resolve: mode === 'optional' ? filters.resolveCommon : undefined,
        },
        create: {
          arg: graphql.arg({
            type: graphql.BigInt,
            defaultValue: typeof defaultValue === 'bigint' ? defaultValue : undefined,
          }),
          resolve (value) {
            if (value === undefined && typeof defaultValue === 'bigint') {
              return defaultValue
            }
            return value
          },
        },
        update: { arg: graphql.arg({ type: graphql.BigInt }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: graphql.BigInt,
      }),
      __ksTelemetryFieldTypeName: '@keystone-6/bigInt',
      views: '@keystone-6/core/fields/types/bigInt/views',
      getAdminMeta () {
        return {
          validation: {
            min: validation.min.toString(),
            max: validation.max.toString(),
            isRequired: validation.isRequired,
          },
          defaultValue: typeof defaultValue === 'bigint' ? defaultValue.toString() : defaultValue,
        }
      },
    })
  }
}
