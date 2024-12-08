// Float in GQL: A signed double-precision floating-point value.
import {
  type BaseListTypeInfo,
  type FieldTypeFunc,
  type CommonFieldConfig,
  fieldType,
  orderDirectionEnum,
} from '../../../types'
import { graphql } from '../../..'
import { filters } from '../../filters'
import { makeValidateHook } from '../../non-null-graphql'
import { mergeFieldHooks } from '../../resolve-hooks'

export type FloatFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    defaultValue?: number
    isIndexed?: boolean | 'unique'
    validation?: {
      min?: number
      max?: number
      isRequired?: boolean
    }
    db?: {
      isNullable?: boolean
      map?: string
      extendPrismaSchema?: (field: string) => string
    }
  }

export function float <ListTypeInfo extends BaseListTypeInfo> (config: FloatFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
  const {
    defaultValue,
    isIndexed,
    validation = {},
  } = config

  const {
    isRequired = false,
    min,
    max
  } = validation

  return (meta) => {
    if (defaultValue !== undefined && (typeof defaultValue !== 'number' || !Number.isFinite(defaultValue))) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies a default value of: ${defaultValue} but it must be a valid finite number`)
    }
    if (min !== undefined && (typeof min !== 'number' || !Number.isFinite(min))) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.min: ${min} but it must be a valid finite number`)
    }
    if (max !== undefined && (typeof max !== 'number' || !Number.isFinite(max))) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.max: ${max} but it must be a valid finite number`)
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
      scalar: 'Float',
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      default: typeof defaultValue === 'number' ? { kind: 'literal', value: defaultValue } : undefined,
      map: config.db?.map,
      extendPrismaSchema: config.db?.extendPrismaSchema,
    })({
      ...config,
      hooks: mergeFieldHooks({ validate }, config.hooks),
      input: {
        uniqueWhere: isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.Float }) } : undefined,
        where: {
          arg: graphql.arg({ type: filters[meta.provider].Float[mode] }),
          resolve: mode === 'optional' ? filters.resolveCommon : undefined,
        },
        create: {
          arg: graphql.arg({
            type: graphql.Float,
            defaultValue: typeof defaultValue === 'number' ? defaultValue : undefined,
          }),
          resolve (value) {
            if (value === undefined) {
              return defaultValue ?? null
            }
            return value
          },
        },
        update: { arg: graphql.arg({ type: graphql.Float }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: graphql.Float,
      }),
      __ksTelemetryFieldTypeName: '@keystone-6/float',
      views: '@keystone-6/core/fields/types/float/views',
      getAdminMeta () {
        return {
          validation: {
            isRequired,
            min: min ?? null,
            max: max ?? null,
          },
          defaultValue: defaultValue ?? null,
        }
      },
    })
  }
}
