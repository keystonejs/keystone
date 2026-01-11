import { g } from '../../..'
import type { SimpleFieldTypeInfo } from '../../../types'
import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  fieldType,
  orderDirectionEnum,
} from '../../../types'
import { filters } from '../../filters'
import { defaultIsRequired, makeValidateHook } from '../../non-null-graphql'
import type { controller } from './views'

export type IntegerFieldConfig<ListTypeInfo extends BaseListTypeInfo> = CommonFieldConfig<
  ListTypeInfo,
  SimpleFieldTypeInfo<'Int'>
> & {
  isIndexed?: boolean | 'unique'
  defaultValue?: number | null | { kind: 'autoincrement' }
  validation?: {
    isRequired?: boolean
    min?: number
    max?: number
  }
  db?: {
    isNullable?: boolean
    map?: string
    extendPrismaSchema?: (field: string) => string
  }
}

// for a signed 32-bit integer
const MAX_INT = 0x7fffffff
const MIN_INT = -0x80000000

export function integer<ListTypeInfo extends BaseListTypeInfo>(
  config: IntegerFieldConfig<ListTypeInfo> = {}
): FieldTypeFunc<ListTypeInfo> {
  const { defaultValue: defaultValue_, isIndexed, validation = {} } = config

  const { isRequired = false, min, max } = validation
  const defaultValue =
    typeof defaultValue_ === 'number' ? defaultValue_ : (defaultValue_?.kind ?? null)

  return meta => {
    if (typeof defaultValue === 'number' && !Number.isInteger(defaultValue)) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} specifies a default value of: ${defaultValue} but it must be a valid finite number`
      )
    }
    if (min !== undefined && !Number.isInteger(min)) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} specifies validation.min: ${min} but it must be an integer`
      )
    }
    if (max !== undefined && !Number.isInteger(max)) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} specifies validation.max: ${max} but it must be an integer`
      )
    }
    if (min !== undefined && (min > MAX_INT || min < MIN_INT)) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} specifies validation.min: ${min} which is outside of the range of a 32-bit signed integer`
      )
    }
    if (max !== undefined && (max > MAX_INT || max < MIN_INT)) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} specifies validation.max: ${max} which is outside of the range of a 32-bit signed integer`
      )
    }
    if (min !== undefined && max !== undefined && min > max) {
      throw new Error(
        `${meta.listKey}.${meta.fieldKey} specifies a validation.max that is less than the validation.min, and therefore has no valid options`
      )
    }

    const hasAdditionalValidation = min !== undefined || max !== undefined
    const { mode, validate } = makeValidateHook(
      meta,
      config,
      hasAdditionalValidation
        ? ({ resolvedData, operation, addValidationError }) => {
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
          }
        : undefined,
      defaultValue !== null
    )

    return fieldType({
      kind: 'scalar',
      mode,
      scalar: 'Int',
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      default:
        typeof defaultValue === 'number'
          ? { kind: 'literal', value: defaultValue }
          : defaultValue === 'autoincrement'
            ? { kind: 'autoincrement' }
            : undefined,
      map: config.db?.map,
      extendPrismaSchema: config.db?.extendPrismaSchema,
    })({
      ...config,
      ...defaultIsRequired(config, isRequired),
      hooks: {
        ...config.hooks,
        validate,
      },
      input: {
        uniqueWhere: isIndexed === 'unique' ? { arg: g.arg({ type: g.Int }) } : undefined,
        where: {
          arg: g.arg({ type: filters[meta.provider].Int[mode] }),
          resolve: mode === 'optional' ? filters.resolveCommon : undefined,
        },
        create: {
          arg: g.arg({
            type: g.Int,
            defaultValue: typeof defaultValue === 'number' ? defaultValue : undefined,
          }),
          resolve(value) {
            if (value === undefined) {
              if (defaultValue === 'autoincrement') return undefined
              return defaultValue
            }
            return value
          },
        },
        update: { arg: g.arg({ type: g.Int }) },
        orderBy: { arg: g.arg({ type: orderDirectionEnum }) },
      },
      output: g.field({ type: g.Int }),
      __ksTelemetryFieldTypeName: '@keystone-6/integer',
      views: '@keystone-6/core/fields/types/integer/views',
      getAdminMeta(): Parameters<typeof controller>[0]['fieldMeta'] {
        return {
          validation: {
            min: min ?? MIN_INT,
            max: max ?? MAX_INT,
          },
          defaultValue,
        }
      },
    })
  }
}
