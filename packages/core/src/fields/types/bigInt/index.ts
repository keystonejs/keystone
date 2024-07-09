import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  fieldType,
  orderDirectionEnum,
} from '../../../types'
import { graphql } from '../../..'
import { filters } from '../../filters'
import {
  resolveDbNullable,
  makeValidateHook
} from '../../non-null-graphql'
import { mergeFieldHooks } from '../../resolve-hooks'

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

// these are the lowest and highest values for a signed 64-bit integer
const MAX_INT = 9223372036854775807n
const MIN_INT = -9223372036854775808n

export function bigInt <ListTypeInfo extends BaseListTypeInfo> (config: BigIntFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
  const {
    defaultValue: _defaultValue,
    isIndexed,
    validation = {},
  } = config

  const {
    isRequired = false,
    min,
    max
  } = validation

  return (meta) => {
    const defaultValue = _defaultValue ?? null
    const hasAutoIncDefault =
      typeof defaultValue == 'object' &&
      defaultValue !== null &&
      defaultValue.kind === 'autoincrement'

    if (hasAutoIncDefault) {
      if (meta.provider === 'sqlite' || meta.provider === 'mysql') {
        throw new Error(`${meta.listKey}.${meta.fieldKey} specifies defaultValue: { kind: 'autoincrement' }, this is not supported on ${meta.provider}`)
      }
      const isNullable = resolveDbNullable(validation, config.db)
      if (isNullable !== false) {
        throw new Error(
          `${meta.listKey}.${meta.fieldKey} specifies defaultValue: { kind: 'autoincrement' } but doesn't specify db.isNullable: false.\n` +
            `Having nullable autoincrements on Prisma currently incorrectly creates a non-nullable column so it is not allowed.\n` +
            `https://github.com/prisma/prisma/issues/8663`
        )
      }
      if (isRequired) {
        throw new Error(`${meta.listKey}.${meta.fieldKey} defaultValue: { kind: 'autoincrement' } conflicts with validation.isRequired: true`)
      }
    }
    if (min !== undefined && !Number.isInteger(min)) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.min: ${min} but it must be an integer`)
    }
    if (max !== undefined && !Number.isInteger(max)) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.max: ${max} but it must be an integer`)
    }
    if (min !== undefined && (min > MAX_INT || min < MIN_INT)) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.min: ${min} which is outside of the range of a 64-bit signed integer`)
    }
    if (max !== undefined && (max > MAX_INT || max < MIN_INT)) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.max: ${max} which is outside of the range of a 64-bit signed integer`)
    }
    if (
      min !== undefined &&
      max !== undefined &&
      min > max
    ) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies a validation.max that is less than the validation.min, and therefore has no valid options`)
    }

    const hasAdditionalValidation = min !== undefined || max !== undefined
    const {
      mode,
      validate,
    } = makeValidateHook(meta, config, hasAdditionalValidation ? ({ resolvedData, operation, addValidationError }) => {
      if (operation === 'delete') return

      const value = resolvedData[meta.fieldKey]
      if (typeof value === 'number') {
        if (min !== undefined && value < min) {
          addValidationError(`value must be greater than or equal to ${min}`)
        }

        if (max !== undefined && value > max) {
          addValidationError(`value must be less than or equal to ${max}`)
        }
      }
    } : undefined)

    return fieldType({
      kind: 'scalar',
      mode,
      scalar: 'BigInt',
      // this will resolve to 'index' if the boolean is true, otherwise other values - false will be converted to undefined
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
      hooks: mergeFieldHooks({ validate }, config.hooks),
      input: {
        uniqueWhere: isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.BigInt }) } : undefined,
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
      output: graphql.field({ type: graphql.BigInt, }),
      __ksTelemetryFieldTypeName: '@keystone-6/bigInt',
      views: '@keystone-6/core/fields/types/bigInt/views',
      getAdminMeta () {
        return {
          validation: {
            min: min?.toString() ?? `${MIN_INT}`,
            max: max?.toString() ?? `${MAX_INT}`,
            isRequired,
          },
          defaultValue:
            typeof defaultValue === 'bigint'
              ? defaultValue.toString()
              : defaultValue,
        }
      },
    })
  }
}
