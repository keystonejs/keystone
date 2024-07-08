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

export function float <ListTypeInfo extends BaseListTypeInfo>(config: FloatFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
  const {
    defaultValue,
    isIndexed,
    validation: v = {},
  } = config
  return (meta) => {
    if (
      defaultValue !== undefined &&
      (typeof defaultValue !== 'number' || !Number.isFinite(defaultValue))
    ) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies a default value of: ${defaultValue} but it must be a valid finite number`)
    }

    if (
      v.min !== undefined &&
      (typeof v.min !== 'number' || !Number.isFinite(v.min))
    ) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.min: ${v.min} but it must be a valid finite number`)
    }

    if (
      v.max !== undefined &&
      (typeof v.max !== 'number' || !Number.isFinite(v.max))
    ) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.max: ${v.max} but it must be a valid finite number`)
    }

    if (
      v.min !== undefined &&
      v.max !== undefined &&
      v.min > v.max
    ) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies a validation.max that is less than the validation.min, and therefore has no valid options`)
    }

    const hasAdditionalValidation = v.min !== undefined || v.max !== undefined
    const {
      mode,
      validate,
    } = makeValidateHook(meta, config, hasAdditionalValidation ? ({ resolvedData, operation, addValidationError }) => {
      if (operation === 'delete') return

      const value = resolvedData[meta.fieldKey]
      if (typeof value === 'number') {
        if (v.max !== undefined && value > v.max) {
          addValidationError(`value must be less than or equal to ${v.max}`
          )
        }

        if (v.min !== undefined && value < v.min) {
          addValidationError(`value must be greater than or equal to ${v.min}`)
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
            isRequired: v.isRequired ?? false,
            min: v.min ?? null,
            max: v.max ?? null,
          },
          defaultValue: defaultValue ?? null,
        }
      },
    })
  }
}
