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

export const float =
  <ListTypeInfo extends BaseListTypeInfo>({
    isIndexed,
    validation,
    defaultValue,
    ...config
  }: FloatFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> =>
  meta => {
    if (
      defaultValue !== undefined &&
      (typeof defaultValue !== 'number' || !Number.isFinite(defaultValue))
    ) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies a default value of: ${defaultValue} but it must be a valid finite number`)
    }

    if (
      validation?.min !== undefined &&
      (typeof validation.min !== 'number' || !Number.isFinite(validation.min))
    ) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.min: ${validation.min} but it must be a valid finite number`)
    }

    if (
      validation?.max !== undefined &&
      (typeof validation.max !== 'number' || !Number.isFinite(validation.max))
    ) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.max: ${validation.max} but it must be a valid finite number`)
    }

    if (
      validation?.min !== undefined &&
      validation?.max !== undefined &&
      validation.min > validation.max
    ) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies a validation.max that is less than the validation.min, and therefore has no valid options`)
    }

    const {
      mode,
      validate,
    } = makeValidateHook(meta, config, ({ resolvedData, operation, addValidationError }) => {
      if (operation === 'delete') return

      const value = resolvedData[meta.fieldKey]
      if (typeof value === 'number') {
        if (validation?.max !== undefined && value > validation.max) {
          addValidationError(`value must be less than or equal to ${validation.max}`
          )
        }

        if (validation?.min !== undefined && value < validation.min) {
          addValidationError(`value must be greater than or equal to ${validation.min}`)
        }
      }
    })

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
        uniqueWhere:
          isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.Float }) } : undefined,
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
            min: validation?.min || null,
            max: validation?.max || null,
            isRequired: validation?.isRequired ?? false,
          },
          defaultValue: defaultValue ?? null,
        }
      },
    })
  }
