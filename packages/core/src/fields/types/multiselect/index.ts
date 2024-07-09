import { classify } from 'inflection'
import { humanize } from '../../../lib/utils'
import {
  type BaseListTypeInfo,
  type FieldTypeFunc,
  type CommonFieldConfig,
  type FieldData,
  jsonFieldTypePolyfilledForSQLite,
} from '../../../types'
import { graphql } from '../../..'
import { makeValidateHook } from '../../non-null-graphql'
import { mergeFieldHooks } from '../../resolve-hooks'

export type MultiselectFieldConfig<ListTypeInfo extends BaseListTypeInfo> =
  CommonFieldConfig<ListTypeInfo> &
    (
      | {
          /**
           * When a value is provided as just a string, it will be formatted in the same way
           * as field labels are to create the label.
           */
          options: readonly ({ label: string, value: string } | string)[]
          /**
           * If `enum` is provided on SQLite, it will use an enum in GraphQL but a string in the database.
           */
          type?: 'string' | 'enum'
          defaultValue?: readonly string[] | null
        }
      | {
          options: readonly { label: string, value: number }[]
          type: 'integer'
          defaultValue?: readonly number[] | null
        }
    ) & {
      db?: {
        isNullable?: boolean
        map?: string
        extendPrismaSchema?: (field: string) => string
      }
    }

// these are the lowest and highest values for a signed 32-bit integer
const MAX_INT = 2147483647
const MIN_INT = -2147483648

export function multiselect <ListTypeInfo extends BaseListTypeInfo> (
  config: MultiselectFieldConfig<ListTypeInfo>
): FieldTypeFunc<ListTypeInfo> {
  const {
    defaultValue: defaultValue_,
  } = config

  config.db ??= {}
  config.db.isNullable ??= false // TODO: deprecated, remove in breaking change
  const defaultValue = config.db.isNullable ? defaultValue_ : (defaultValue_ ?? []) // TODO: deprecated, remove in breaking change?

  return (meta) => {
    if ((config as any).isIndexed === 'unique') {
      throw TypeError("isIndexed: 'unique' is not a supported option for field type multiselect")
    }

    const output = <T extends graphql.NullableOutputType>(type: T) => nonNullList(type)
    const create = <T extends graphql.NullableInputType>(type: T) => {
      return graphql.arg({ type: nonNullList(type) })
    }

    const resolveCreate = <T extends string | number>(val: T[] | null | undefined): T[] | null => {
      const resolved = resolveUpdate(val)
      if (resolved === undefined) {
        return defaultValue as T[]
      }
      return resolved
    }

    const resolveUpdate = <T extends string | number>(
      val: T[] | null | undefined
    ): T[] | null | undefined => {
      return val
    }

    const transformedConfig = configToOptionsAndGraphQLType(config, meta)
    const accepted = new Set(transformedConfig.options.map(x => x.value))
    if (accepted.size !== transformedConfig.options.length) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} has duplicate options, this is not allowed`)
    }

    const {
      mode,
      validate,
    } = makeValidateHook(meta, config, ({ inputData, operation, addValidationError }) => {
      if (operation === 'delete') return

      const values: readonly (string | number)[] | null | undefined = inputData[meta.fieldKey] // resolvedData is JSON
      if (values != null) {
        for (const value of values) {
          if (!accepted.has(value)) {
            addValidationError(`'${value}' is not an accepted option`)
          }
        }
        if (new Set(values).size !== values.length) {
          addValidationError(`non-unique set of options selected`)
        }
      }
    })

    return jsonFieldTypePolyfilledForSQLite(
      meta.provider,
      {
        ...config,
        __ksTelemetryFieldTypeName: '@keystone-6/multiselect',
        hooks: mergeFieldHooks({ validate }, config.hooks),
        views: '@keystone-6/core/fields/types/multiselect/views',
        getAdminMeta: () => ({
          options: transformedConfig.options,
          type: config.type ?? 'string',
          defaultValue: [],
        }),
        input: {
          create: { arg: create(transformedConfig.graphqlType), resolve: resolveCreate },
          update: {
            arg: graphql.arg({ type: nonNullList(transformedConfig.graphqlType) }),
            resolve: resolveUpdate,
          },
        },
        output: graphql.field({
          type: output(transformedConfig.graphqlType),
          resolve ({ value }) {
            return value as any
          },
        }),
      },
      {
        mode,
        map: config?.db?.map,
        extendPrismaSchema: config.db?.extendPrismaSchema,
        default: {
          kind: 'literal',
          value: JSON.stringify(defaultValue ?? null)
        },
      }
    )
  }
}

function configToOptionsAndGraphQLType (
  config: MultiselectFieldConfig<BaseListTypeInfo>,
  meta: FieldData
) {
  if (config.type === 'integer') {
    if (
      config.options.some(
        ({ value }) => !Number.isInteger(value) || value > MAX_INT || value < MIN_INT
      )
    ) {
      throw new Error(`${meta.listKey}.${meta.fieldKey} specifies integer values that are outside the range of a 32-bit signed integer`)
    }
    return {
      type: 'integer' as const,
      graphqlType: graphql.Int,
      options: config.options,
    }
  }

  const options = config.options.map(option => {
    if (typeof option === 'string') {
      return {
        label: humanize(option),
        value: option,
      }
    }
    return option
  })

  if (config.type === 'enum') {
    const enumName = `${meta.listKey}${classify(meta.fieldKey)}Type`
    const graphqlType = graphql.enum({
      name: enumName,
      values: graphql.enumValues(options.map(x => x.value)),
    })
    return {
      type: 'enum' as const,
      graphqlType,
      options,
    }
  }
  return {
    type: 'string' as const,
    graphqlType: graphql.String,
    options,
  }
}

const nonNullList = <T extends graphql.NullableType>(type: T) => graphql.list(graphql.nonNull(type))
