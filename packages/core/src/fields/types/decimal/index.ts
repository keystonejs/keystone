import { humanize } from '../../../lib/utils'
import {
  fieldType,
  type FieldTypeFunc,
  type BaseListTypeInfo,
  type CommonFieldConfig,
  orderDirectionEnum,
  Decimal,
  type FieldData,
} from '../../../types'
import { graphql } from '../../..'
import {
  assertReadIsNonNullAllowed,
  getResolvedIsNullable,
  resolveHasValidation,
} from '../../non-null-graphql'
import { filters } from '../../filters'
import { type DecimalFieldMeta } from './views'
import { mergeFieldHooks, type InternalFieldHooks } from '../../resolve-hooks'

export type DecimalFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    validation?: {
      min?: string
      max?: string
      isRequired?: boolean
    }
    precision?: number
    scale?: number
    defaultValue?: string
    isIndexed?: boolean | 'unique'
    db?: {
      isNullable?: boolean
      map?: string
      extendPrismaSchema?: (field: string) => string
    }
  }

function parseDecimalValueOption (meta: FieldData, value: string, name: string) {
  let decimal: Decimal
  try {
    decimal = new Decimal(value)
  } catch (err) {
    throw new Error(
      `The decimal field at ${meta.listKey}.${meta.fieldKey} specifies ${name}: ${value}, this is not valid decimal value.`
    )
  }
  if (!decimal.isFinite()) {
    throw new Error(
      `The decimal field at ${meta.listKey}.${meta.fieldKey} specifies ${name}: ${value} which is not finite but ${name} must be finite.`
    )
  }
  return decimal
}

export const decimal =
  <ListTypeInfo extends BaseListTypeInfo>({
    isIndexed,
    precision = 18,
    scale = 4,
    validation,
    defaultValue,
    ...config
  }: DecimalFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> =>
  meta => {
    if (meta.provider === 'sqlite') {
      throw new Error('The decimal field does not support sqlite')
    }

    if (!Number.isInteger(scale)) {
      throw new Error(
        `The scale for decimal fields must be an integer but the scale for the decimal field at ${meta.listKey}.${meta.fieldKey} is not an integer`
      )
    }

    if (!Number.isInteger(precision)) {
      throw new Error(
        `The precision for decimal fields must be an integer but the precision for the decimal field at ${meta.listKey}.${meta.fieldKey} is not an integer`
      )
    }

    if (scale > precision) {
      throw new Error(
        `The scale configured for decimal field at ${meta.listKey}.${meta.fieldKey} (${scale}) ` +
          `must not be larger than the field's precision (${precision})`
      )
    }

    const fieldLabel = config.label ?? humanize(meta.fieldKey)

    const max =
      validation?.max === undefined
        ? undefined
        : parseDecimalValueOption(meta, validation.max, 'validation.max')
    const min =
      validation?.min === undefined
        ? undefined
        : parseDecimalValueOption(meta, validation.min, 'validation.min')

    if (min !== undefined && max !== undefined && max.lessThan(min)) {
      throw new Error(
        `The decimal field at ${meta.listKey}.${meta.fieldKey} specifies a validation.max that is less than the validation.min, and therefore has no valid options`
      )
    }

    const parsedDefaultValue =
      defaultValue === undefined
        ? undefined
        : parseDecimalValueOption(meta, defaultValue, 'defaultValue')

    const isNullable = getResolvedIsNullable(validation, config.db)
    const hasValidation = resolveHasValidation(config.db, validation)

    assertReadIsNonNullAllowed(meta, config, isNullable)

    const mode = isNullable === false ? 'required' : 'optional'
    const index = isIndexed === true ? 'index' : isIndexed || undefined
    const dbField = {
      kind: 'scalar',
      mode,
      scalar: 'Decimal',
      nativeType: `Decimal(${precision}, ${scale})`,
      index,
      default:
        defaultValue === undefined ? undefined : { kind: 'literal' as const, value: defaultValue },
      map: config.db?.map,
      extendPrismaSchema: config.db?.extendPrismaSchema,
    } as const

    const hooks: InternalFieldHooks<ListTypeInfo> = {}
    if (hasValidation) {
      hooks.validate = ({ resolvedData, addValidationError, operation }) => {
        if (operation === 'delete') return

        const val: Decimal | null | undefined = resolvedData[meta.fieldKey]

        if (val === null && (validation?.isRequired || isNullable === false)) {
          addValidationError(`${fieldLabel} is required`)
        }
        if (val != null) {
          if (min !== undefined && val.lessThan(min)) {
            addValidationError(`${fieldLabel} must be greater than or equal to ${min}`)
          }

          if (max !== undefined && val.greaterThan(max)) {
            addValidationError(`${fieldLabel} must be less than or equal to ${max}`)
          }
        }
      }
    }

    return fieldType(dbField)({
      ...config,
      hooks: mergeFieldHooks(hooks, config.hooks),
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
            if (val === undefined) {
              return parsedDefaultValue ?? null
            }
            return val
          },
        },
        update: {
          arg: graphql.arg({ type: graphql.Decimal }),
        },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: graphql.Decimal,
        resolve ({ value }) {
          if (value === null) {
            return null
          }
          const val: Decimal & { scaleToPrint?: number } = new Decimal(value)
          val.scaleToPrint = scale
          return val
        },
      }),
      __ksTelemetryFieldTypeName: '@keystone-6/decimal',
      views: '@keystone-6/core/fields/types/decimal/views',
      getAdminMeta: (): DecimalFieldMeta => ({
        defaultValue: defaultValue ?? null,
        precision,
        scale,
        validation: {
          isRequired: validation?.isRequired ?? false,
          max: validation?.max ?? null,
          min: validation?.min ?? null,
        },
      }),
    })
  }
