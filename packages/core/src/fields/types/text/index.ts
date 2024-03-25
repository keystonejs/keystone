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
  resolveHasValidation,
} from '../../non-null-graphql'
import { filters } from '../../filters'

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

export function text <ListTypeInfo extends BaseListTypeInfo>(
  config: TextFieldConfig<ListTypeInfo> = {}
): FieldTypeFunc<ListTypeInfo> {
  const {
    isIndexed,
    defaultValue: defaultValue_,
    validation: validation_
  } = config

  return (meta) => {
    for (const type of ['min', 'max'] as const) {
      const val = validation_?.length?.[type]
      if (val !== undefined && (!Number.isInteger(val) || val < 0)) {
        throw new Error(`The text field at ${meta.listKey}.${meta.fieldKey} specifies validation.length.${type}: ${val} but it must be a positive integer`)
      }
      if (validation_?.isRequired && val !== undefined && val === 0) {
        throw new Error(`The text field at ${meta.listKey}.${meta.fieldKey} specifies validation.isRequired: true and validation.length.${type}: 0, this is not allowed because validation.isRequired implies at least a min length of 1`)
      }
    }

    if (
      validation_?.length?.min !== undefined &&
      validation_?.length?.max !== undefined &&
      validation_?.length?.min > validation_?.length?.max
    ) {
      throw new Error(`The text field at ${meta.listKey}.${meta.fieldKey} specifies a validation.length.max that is less than the validation.length.min, and therefore has no valid options`)
    }

    const validation = validation_ ? {
      ...validation_,
      length: {
        min: validation_?.isRequired ? validation_?.length?.min ?? 1 : validation_?.length?.min,
        max: validation_?.length?.max,
      },
    } : undefined

    // defaulted to false as a zero length string is preferred to null
    const isNullable = config.db?.isNullable ?? false
    assertReadIsNonNullAllowed(meta, config, isNullable)

    const defaultValue = isNullable ? (defaultValue_ ?? null) : (defaultValue_ ?? '')
    const fieldLabel = config.label ?? humanize(meta.fieldKey)
    const mode = isNullable ? 'optional' : 'required'
    const hasValidation = resolveHasValidation(config) || !isNullable // we make an exception for Text

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
      hooks: {
        ...config.hooks,
        validateInput: hasValidation ? async (args) => {
          const val = args.resolvedData[meta.fieldKey]
          if (val === null && (validation?.isRequired || isNullable === false)) {
            args.addValidationError(`${fieldLabel} is required`)
          }
          if (val != null) {
            if (validation?.length?.min !== undefined && val.length < validation.length.min) {
              if (validation.length.min === 1) {
                args.addValidationError(`${fieldLabel} must not be empty`)
              } else {
                args.addValidationError(`${fieldLabel} must be at least ${validation.length.min} characters long`)
              }
            }
            if (validation?.length?.max !== undefined && val.length > validation.length.max) {
              args.addValidationError(`${fieldLabel} must be no longer than ${validation.length.max} characters`)
            }
            if (validation?.match && !validation.match.regex.test(val)) {
              args.addValidationError(validation.match.explanation || `${fieldLabel} must match ${validation.match.regex}`)
            }
          }

          await config.hooks?.validateInput?.(args)
        } : config.hooks?.validateInput
      },
      input: {
        uniqueWhere:
          isIndexed === 'unique' ? { arg: graphql.arg({ type: graphql.String }) } : undefined,
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
            if (val === undefined) {
              return defaultValue ?? null
            }
            return val
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
            isRequired: validation?.isRequired ?? false,
            match: validation?.match
              ? {
                  regex: {
                    source: validation.match.regex.source,
                    flags: validation.match.regex.flags,
                  },
                  explanation: validation.match.explanation ?? null,
                }
              : null,
            length: { max: validation?.length?.max ?? null, min: validation?.length?.min ?? null },
          },
          defaultValue: defaultValue ?? (isNullable ? null : ''),
          isNullable,
        }
      },
    })
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
