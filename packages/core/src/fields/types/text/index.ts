import {
  type BaseListTypeInfo,
  type CommonFieldConfig,
  type FieldTypeFunc,
  fieldType,
  orderDirectionEnum,
} from '../../../types'
import { graphql } from '../../..'
import { makeValidateHook } from '../../non-null-graphql'
import { filters } from '../../filters'
import { mergeFieldHooks } from '../../resolve-hooks'

export type TextFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> & {
    isIndexed?: true | 'unique'
    ui?: {
      displayMode?: 'input' | 'textarea'
    }
    validation?: {
      /**
       * Makes the field disallow null values and require a string at least 1 character long
       */
      isRequired?: boolean
      match?: { regex: RegExp, explanation?: string }
      length?: { min?: number, max?: number }
    }
    defaultValue?: string | null
    db?: {
      isNullable?: boolean
      map?: string
      extendPrismaSchema?: (field: string) => string
      /**
       * The underlying database type.
       * Only some of the types are supported on PostgreSQL and MySQL.
       * The native type is not customisable on SQLite.
       * See Prisma's documentation for more information about the supported types.
       *
       * https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#string
       */
      nativeType?:
        | 'Text' // PostgreSQL and MySQL
        | `VarChar(${number})`
        | `Char(${number})`
        | `Bit(${number})` // PostgreSQL
        | 'VarBit'
        | 'Uuid'
        | 'Xml'
        | 'Inet'
        | 'Citext'
        | 'TinyText' // MySQL
        | 'MediumText'
        | 'LargeText'
    }
  }

export type TextFieldMeta = {
  displayMode: 'input' | 'textarea'
  shouldUseModeInsensitive: boolean
  isNullable: boolean
  validation: {
    isRequired: boolean
    match: { regex: { source: string, flags: string }, explanation: string | null } | null
    length: { min: number | null, max: number | null }
  }
  defaultValue: string | null
}

export function text <ListTypeInfo extends BaseListTypeInfo> (
  config: TextFieldConfig<ListTypeInfo> = {}
): FieldTypeFunc<ListTypeInfo> {
  const {
    defaultValue: defaultValue_,
    isIndexed,
    validation = {}
  } = config

  config.db ??= {}
  config.db.isNullable ??= false // TODO: sigh, remove in breaking change?

  const isRequired = validation.isRequired ?? false
  const match = validation.match
  const min = validation.isRequired ? validation.length?.min ?? 1 : validation.length?.min
  const max = validation.length?.max

  return (meta) => {
    if (min !== undefined && (!Number.isInteger(min) || min < 0)) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.length.min: ${min} but it must be a positive integer`)
    }
    if (max !== undefined && (!Number.isInteger(max) || max < 0)) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.length.max: ${max} but it must be a positive integer`)
    }
    if (isRequired && min !== undefined && min === 0) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.isRequired: true and validation.length.min: 0, this is not allowed because validation.isRequired implies at least a min length of 1`)
    }
    if (isRequired && max !== undefined && max === 0) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies validation.isRequired: true and validation.length.max: 0, this is not allowed because validation.isRequired implies at least a max length of 1`)
    }
    if (
      min !== undefined &&
      max !== undefined &&
      min > max
    ) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies a validation.length.max that is less than the validation.length.min, and therefore has no valid options`)
    }

    // defaulted to false as a zero length string is preferred to null
    const isNullable = config.db?.isNullable ?? false
    const defaultValue = isNullable ? (defaultValue_ ?? null) : (defaultValue_ ?? '')
    const hasAdditionalValidation = match || min !== undefined || max !== undefined
    const {
      mode,
      validate,
    } = makeValidateHook(meta, config, hasAdditionalValidation ? ({ resolvedData, operation, addValidationError }) => {
      if (operation === 'delete') return

      const value = resolvedData[meta.fieldKey]
      if (value != null) {
        if (min !== undefined && value.length < min) {
          if (min === 1) {
            addValidationError(`value must not be empty`)
          } else {
            addValidationError(`value must be at least ${min} characters long`)
          }
        }
        if (max !== undefined && value.length > max) {
          addValidationError(`value must be no longer than ${max} characters`)
        }
        if (match && !match.regex.test(value)) {
          addValidationError(match.explanation ?? `value must match ${match.regex}`)
        }
      }
    } : undefined)

    return fieldType({
      kind: 'scalar',
      mode,
      scalar: 'String',
      default: (defaultValue === null) ? undefined : { kind: 'literal', value: defaultValue },
      index: isIndexed === true ? 'index' : isIndexed || undefined,
      map: config.db?.map,
      nativeType: config.db?.nativeType,
      extendPrismaSchema: config.db?.extendPrismaSchema,
    })({
      ...config,
      hooks: mergeFieldHooks({ validate }, config.hooks),
      input: {
        uniqueWhere: isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.String }) } : undefined,
        where: {
          arg: graphql.arg({
            type: filters[meta.provider].String[mode],
          }),
          resolve: mode === 'required' ? undefined : filters.resolveString,
        },
        create: {
          arg: graphql.arg({
            type: graphql.String,
            defaultValue: typeof defaultValue === 'string' ? defaultValue : undefined,
          }),
          resolve (val) {
            if (val !== undefined) return val
            return defaultValue ?? null
          },
        },
        update: { arg: graphql.arg({ type: graphql.String }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      output: graphql.field({
        type: graphql.String,
      }),
      __ksTelemetryFieldTypeName: '@keystone-6/text',
      views: '@keystone-6/core/fields/types/text/views',
      getAdminMeta (): TextFieldMeta {
        return {
          displayMode: config.ui?.displayMode ?? 'input',
          shouldUseModeInsensitive: meta.provider === 'postgresql',
          validation: {
            isRequired,
            match: match ? {
              regex: {
                source: match.regex.source,
                flags: match.regex.flags,
              },
              explanation: match.explanation ?? `value must match ${match.regex}`,
            } : null,
            length: {
              max: max ?? null,
              min: min ?? null
            },
          },
          defaultValue: defaultValue ?? (isNullable ? null : ''),
          isNullable,
        }
      },
    })
  }
}
