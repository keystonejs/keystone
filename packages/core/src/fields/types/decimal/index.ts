import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  fieldType,
  orderDirectionEnum,
  Decimal,
} from '../../../types'
import { graphql } from '../../..'
import { filters } from '../../filters'
import { makeValidateHook } from '../../non-null-graphql'
import { mergeFieldHooks } from '../../resolve-hooks'

export type DecimalFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    isIndexed?: boolean | 'unique'
    defaultValue?: string | null
    validation?: {
      isRequired?: boolean
      min?: string
      max?: string
    }
    precision?: number
    scale?: number
    db?: {
      isNullable?: boolean
      map?: string
      extendPrismaSchema?: (field: string) => string
    }
  }

function safeParseDecimal (value: string | null | undefined) {
  if (value === null || value === undefined) return value
  const result = new Decimal(value)
  if (!result.isFinite()) throw new Error(`"${value}" is not finite`)
  return result
}

export function decimal <ListTypeInfo extends BaseListTypeInfo> (config: DecimalFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
  const {
    defaultValue: defaultValue_,
    isIndexed,
    precision = 18,
    scale = 4,
    validation,
  } = config

  const {
    isRequired = false,
    min,
    max
  } = validation
  const defaultValue = typeof defaultValue_ === 'bigint' ? defaultValue_ : (defaultValue_?.kind ?? null)

  const parsedDefaultValue = safeParseDecimal(defaultValue)
  const parsedMax = safeParseDecimal(max) ?? undefined
  const parsedMin = safeParseDecimal(min) ?? undefined

  return (meta) => {
    if (meta.provider === 'sqlite') {
      throw new Error('The decimal field does not support sqlite')
    }
    if (!Number.isInteger(scale)) {
      throw new TypeError( `The scale for decimal fields must be an integer but the scale for the decimal field at ${meta.listKey}.${meta.fieldKey} is not an integer`)
    }
    if (!Number.isInteger(precision)) {
      throw new TypeError( `The precision for decimal fields must be an integer but the precision for the decimal field at ${meta.listKey}.${meta.fieldKey} is not an integer`)
    }
    if (scale > precision) {
      throw new Error(
        `The scale configured for decimal field at ${meta.listKey}.${meta.fieldKey} (${scale}) ` +
          `must not be larger than the field's precision (${precision})`
      )
    }
    if (defaultValue !== undefined && !parsedDefaultValue) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies a default value of: ${defaultValue} but it must be a valid finite number`)
    }
    if (min !== undefined && !parsedMin) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.min: ${min} but it must be a valid finite number`)
    }
    if (max !== undefined && !parsedMax) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.max: ${max} but it must be a valid finite number`)
    }
    if (
      min !== undefined &&
      max !== undefined &&
      parsedMin && parsedMax &&
      parsedMin > parsedMax
    ) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies a validation.max that is less than the validation.min, and therefore has no valid options`)
    }

    const hasAdditionalValidation = min !== undefined || max !== undefined
    const {
      mode,
      validate,
    } = makeValidateHook(meta, config, hasAdditionalValidation ? ({ resolvedData, operation, addValidationError }) => {
      if (operation === 'delete') return

      const value = safeParseDecimal(resolvedData[meta.fieldKey])
      if (value != null) {
        if (parsedMin !== undefined && value.lessThan(parsedMin)) {
          addValidationError(`value must be greater than or equal to ${min}`)
        }

        if (parsedMax !== undefined && value.greaterThan(parsedMax)) {
          addValidationError(`value must be less than or equal to ${max}`)
        }
      }
    } : undefined)

    return fieldType({
      kind: 'scalar',
      mode,
      scalar: 'Decimal',
      nativeType: `Decimal(${precision}, ${scale})`,
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      default:
        typeof defaultValue === 'string'
          ? { kind: 'literal', value: defaultValue }
          : undefined,
      map: config.db?.map,
      extendPrismaSchema: config.db?.extendPrismaSchema,
    })({
      ...config,
      hooks: mergeFieldHooks({ validate }, config.hooks),
      input: {
        uniqueWhere:
          isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.Decimal }) } : undefined,
        where: {
          arg: graphql.arg({ type: filters[meta.provider].Decimal[mode] }),
          resolve: mode === 'optional' ? filters.resolveCommon : undefined,
        },
        create: {
          arg: graphql.arg({
            type: graphql.Decimal,
            defaultValue: parsedDefaultValue,
          }),
          resolve (val) {
            if (val === undefined) return parsedDefaultValue
            return val
          },
        },
        update: { arg: graphql.arg({ type: graphql.Decimal }), },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: graphql.Decimal,
        resolve ({ value }) {
          if (value === null) return null
          const val: Decimal & { scaleToPrint?: number } = new Decimal(value)
          val.scaleToPrint = scale
          return val
        },
      }),
      __ksTelemetryFieldTypeName: '@keystone-6/decimal',
      views: '@keystone-6/core/fields/types/decimal/views',
      getAdminMeta () {
        return {
          validation: {
            isRequired,
            max: max ?? null,
            min: min ?? null,
          },
          defaultValue,
          precision,
          scale,
        }
      },
    })
  }
}
