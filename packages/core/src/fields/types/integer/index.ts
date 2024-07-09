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
  resolveHasValidation
} from '../../non-null-graphql'
import { filters } from '../../filters'
import { mergeFieldHooks, type InternalFieldHooks } from '../../resolve-hooks'

export type IntegerFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    isIndexed?: boolean | 'unique'
    defaultValue?: number | { kind: 'autoincrement' }
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

// These are the max and min values available to a 32 bit signed integer
const MAX_INT = 2147483647
const MIN_INT = -2147483648

export function integer <ListTypeInfo extends BaseListTypeInfo> ({
  isIndexed,
  defaultValue: _defaultValue,
  validation,
  ...config
}: IntegerFieldConfig<ListTypeInfo> = {}): FieldTypeFunc<ListTypeInfo> {
  return meta => {
    const defaultValue = _defaultValue ?? null
    const hasAutoIncDefault =
      typeof defaultValue == 'object' &&
      defaultValue !== null &&
      defaultValue.kind === 'autoincrement'

    const isNullable = getResolvedIsNullable(validation, config.db)

    if (hasAutoIncDefault) {
      if (meta.provider === 'sqlite' || meta.provider === 'mysql') {
        throw new Error(
          `The integer field at ${meta.listKey}.${meta.fieldKey} specifies defaultValue: { kind: 'autoincrement' }, this is not supported on ${meta.provider}`
        )
      }
      if (isNullable !== false) {
        throw new Error(
          `The integer field at ${meta.listKey}.${meta.fieldKey} specifies defaultValue: { kind: 'autoincrement' } but doesn't specify db.isNullable: false.\n` +
            `Having nullable autoincrements on Prisma currently incorrectly creates a non-nullable column so it is not allowed.\n` +
            `https://github.com/prisma/prisma/issues/8663`
        )
      }
    }

    if (validation?.min !== undefined && !Number.isInteger(validation.min)) {
      throw new Error(
        `The integer field at ${meta.listKey}.${meta.fieldKey} specifies validation.min: ${validation.min} but it must be an integer`
      )
    }
    if (validation?.max !== undefined && !Number.isInteger(validation.max)) {
      throw new Error(
        `The integer field at ${meta.listKey}.${meta.fieldKey} specifies validation.max: ${validation.max} but it must be an integer`
      )
    }

    if (validation?.min !== undefined && (validation?.min > MAX_INT || validation?.min < MIN_INT)) {
      throw new Error(
        `The integer field at ${meta.listKey}.${meta.fieldKey} specifies validation.min: ${validation.min} which is outside of the range of a 32bit signed integer(${MIN_INT} - ${MAX_INT}) which is not allowed`
      )
    }
    if (validation?.max !== undefined && (validation?.max > MAX_INT || validation?.max < MIN_INT)) {
      throw new Error(
        `The integer field at ${meta.listKey}.${meta.fieldKey} specifies validation.max: ${validation.max} which is outside of the range of a 32bit signed integer(${MIN_INT} - ${MAX_INT}) which is not allowed`
      )
    }

    if (
      validation?.min !== undefined &&
      validation?.max !== undefined &&
      validation.min > validation.max
    ) {
      throw new Error(
        `The integer field at ${meta.listKey}.${meta.fieldKey} specifies a validation.max that is less than the validation.min, and therefore has no valid options`
      )
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
          (value === null || (operation === 'create' && value === undefined && !hasAutoIncDefault))
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
      scalar: 'Int',
      // This will resolve to 'index' if the boolean is true, otherwise other values - false will be converted to undefined
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      default:
        typeof defaultValue === 'number'
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
        uniqueWhere: isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.Int }) } : undefined,
        where: {
          arg: graphql.arg({ type: filters[meta.provider].Int[mode] }),
          resolve: mode === 'optional' ? filters.resolveCommon : undefined,
        },
        create: {
          arg: graphql.arg({
            type: graphql.Int,
            defaultValue: typeof defaultValue === 'number' ? defaultValue : undefined,
          }),
          resolve (value) {
            if (value === undefined && typeof defaultValue === 'number') {
              return defaultValue
            }
            return value
          },
        },
        update: { arg: graphql.arg({ type: graphql.Int }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({ type: graphql.Int, }),
      __ksTelemetryFieldTypeName: '@keystone-6/integer',
      views: '@keystone-6/core/fields/types/integer/views',
      getAdminMeta () {
        return {
          validation: {
            min: validation?.min ?? MIN_INT,
            max: validation?.max ?? MAX_INT,
            isRequired: validation?.isRequired ?? false,
          },
          defaultValue:
            defaultValue === null || typeof defaultValue === 'number'
              ? defaultValue
              : 'autoincrement',
        }
      },
    })
  }
}
